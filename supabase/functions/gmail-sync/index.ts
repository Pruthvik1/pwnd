import { createClient } from "npm:@supabase/supabase-js@2";

type GmailSyncPayload = { userId: string; providerToken?: string; providerRefreshToken?: string };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await res.json();
  return data.access_token ?? null;
}

async function gmailGet(path: string, token: string) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: await res.json() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GmailSyncPayload;
    if (!body.userId) return json({ error: "Missing userId" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Missing secrets" }, 500);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Get tokens — prefer body-supplied token (current session), fall back to DB
    let accessToken: string | null = body.providerToken ?? null;
    let refreshToken: string | null = body.providerRefreshToken ?? null;

    if (!accessToken) {
      // Try stored tokens from DB
      const { data: syncRow, error: syncErr } = await supabase
        .from("gmail_sync")
        .select("google_access_token, google_refresh_token")
        .eq("user_id", body.userId)
        .maybeSingle();

      if (syncErr && syncErr.code !== "42703" /* column doesn't exist */) {
        return json({ error: syncErr.message }, 500);
      }

      accessToken = syncRow?.google_access_token ?? null;
      refreshToken = refreshToken ?? syncRow?.google_refresh_token ?? null;
    }

    if (!accessToken) {
      return json(
        { error: "No Google token available. Please sign out and sign in with Google again." },
        400,
      );
    }

    // Persist tokens for future syncs (ignore errors if columns don't exist yet)
    if (body.providerToken) {
      await supabase.from("gmail_sync").upsert(
        {
          user_id: body.userId,
          google_access_token: body.providerToken,
          ...(body.providerRefreshToken ? { google_refresh_token: body.providerRefreshToken } : {}),
        },
        { onConflict: "user_id" },
      );
    }

    // 2. Mark as syncing
    await supabase
      .from("gmail_sync")
      .upsert(
        { user_id: body.userId, sync_status: "syncing", last_synced_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );

    // 3. Fetch recent message list (up to 25)
    let listRes = await gmailGet("/messages?maxResults=25&labelIds=INBOX", accessToken);

    // 4. Refresh token if expired
    if (listRes.status === 401 && refreshToken) {
      const newToken = await refreshGoogleToken(refreshToken);
      if (newToken) {
        accessToken = newToken;
        await supabase
          .from("gmail_sync")
          .update({ google_access_token: newToken })
          .eq("user_id", body.userId);
        listRes = await gmailGet("/messages?maxResults=25&labelIds=INBOX", accessToken);
      }
    }

    if (listRes.status !== 200) {
      await supabase.from("gmail_sync").update({ sync_status: "error" }).eq("user_id", body.userId);
      return json({ error: "Gmail API error", detail: listRes.data }, 502);
    }

    const messageIds: string[] = (listRes.data.messages ?? []).map((m: { id: string }) => m.id);

    // 5. Fetch each message and upsert to emails
    let inserted = 0;
    for (const msgId of messageIds) {
      const { status, data: msg } = await gmailGet(
        `/messages/${msgId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        accessToken,
      );
      if (status !== 200) continue;

      const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h: { name: string }) => h.name.toLowerCase() === name.toLowerCase())?.value ??
        null;

      const subject = get("Subject");
      const from = get("From");
      const to = get("To");
      const dateStr = get("Date");
      const receivedAt = dateStr ? new Date(dateStr).toISOString() : null;
      const snippet: string = msg.snippet ?? "";
      const threadId: string = msg.threadId ?? msgId;
      const isSent = (msg.labelIds ?? []).includes("SENT");

      await supabase.from("emails").upsert(
        {
          user_id: body.userId,
          gmail_message_id: msgId,
          gmail_thread_id: threadId,
          subject,
          from_address: from,
          to_address: to,
          body_preview: snippet,
          is_sent_by_me: isSent,
          received_at: receivedAt,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "gmail_message_id" },
      );
      inserted++;
    }

    // 6. Mark sync done
    await supabase
      .from("gmail_sync")
      .update({ sync_status: "idle", last_synced_at: new Date().toISOString() })
      .eq("user_id", body.userId);

    return json({ ok: true, synced: inserted });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
