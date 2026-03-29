import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { theme } from "@/constants/theme";
import { requireSupabase } from "@/services/supabase";
import { useGmailSyncStatus } from "@/hooks/useGmailSync";

function useCurrentUser() {
  const [user, setUser] = React.useState<{
    email?: string;
    name?: string;
    avatarUrl?: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = requireSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          name:
            data.user.user_metadata?.full_name ??
            data.user.user_metadata?.name ??
            data.user.email?.split("@")[0],
          avatarUrl: data.user.user_metadata?.avatar_url ?? null,
        });
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

function Avatar({ name, size = 72 }: { name?: string; size?: number }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const { user, loading } = useCurrentUser();
  const { data: syncStatus } = useGmailSyncStatus();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    const doSignOut = async () => {
      try {
        setSigningOut(true);
        const supabase = requireSupabase();
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Sign out error", e);
        setSigningOut(false);
      }
    };

    if (Platform.OS === "web") {
      await doSignOut();
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: doSignOut },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color={theme.colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const gmailConnected =
    syncStatus != null && syncStatus.sync_status !== null && syncStatus.sync_status !== "error";
  const lastSynced = syncStatus?.last_synced_at
    ? new Date(syncStatus.last_synced_at).toLocaleString()
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header hero */}
        <View style={styles.hero}>
          <Avatar name={user?.name} />
          <Text style={styles.heroName}>{user?.name ?? "—"}</Text>
          <Text style={styles.heroEmail}>{user?.email ?? "—"}</Text>
        </View>

        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <InfoRow label="Name" value={user?.name ?? "—"} />
          <InfoRow label="Email" value={user?.email ?? "—"} />
          <InfoRow
            label="Google Account"
            value={user?.email?.endsWith("gmail.com") ? "Connected" : "Connected via OAuth"}
            valueColor={theme.colors.success}
          />
        </View>

        {/* Gmail Sync status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gmail Sync</Text>
          <InfoRow
            label="Status"
            value={
              syncStatus == null
                ? "Not set up"
                : syncStatus.sync_status === "syncing"
                  ? "Syncing…"
                  : syncStatus.sync_status === "error"
                    ? "Error"
                    : "Connected"
            }
            valueColor={
              syncStatus == null
                ? theme.colors.muted
                : syncStatus.sync_status === "error"
                  ? theme.colors.danger
                  : theme.colors.success
            }
          />
          {lastSynced && <InfoRow label="Last Synced" value={lastSynced} />}
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutBtnPressed]}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signOutText}>Sign Out</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary, // matches hero top
  },
  scroll: {
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },
  heroName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  heroEmail: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  rowValue: {
    fontSize: 15,
    color: theme.colors.muted,
    maxWidth: "60%",
    textAlign: "right",
  },
  signOutBtn: {
    margin: 16,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutBtnPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
