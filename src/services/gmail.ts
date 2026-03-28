const GMAIL_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me";

function withAuth(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchThread(threadId: string, accessToken: string) {
  const res = await fetch(`${GMAIL_BASE_URL}/threads/${threadId}?format=full`, {
    headers: withAuth(accessToken),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch thread ${threadId}: ${res.status}`);
  }

  return res.json();
}

export async function sendReply(
  threadId: string,
  to: string,
  subject: string,
  body: string,
  accessToken: string,
) {
  const raw = btoa(`To: ${to}\r\nSubject: Re: ${subject}\r\n\r\n${body}`)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(`${GMAIL_BASE_URL}/messages/send`, {
    method: "POST",
    headers: withAuth(accessToken),
    body: JSON.stringify({ raw, threadId }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send Gmail reply: ${res.status}`);
  }

  return res.json();
}

export async function syncNewEmails(historyId: string, accessToken: string) {
  const url = `${GMAIL_BASE_URL}/history?startHistoryId=${historyId}&historyTypes=messageAdded`;
  const res = await fetch(url, { headers: withAuth(accessToken) });

  if (!res.ok) {
    throw new Error(`Failed to sync Gmail history: ${res.status}`);
  }

  return res.json();
}
