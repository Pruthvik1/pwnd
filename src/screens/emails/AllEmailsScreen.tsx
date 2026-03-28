import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useEmails } from "@/hooks/useEmails";
import { useGmailSyncStatus, useTriggerGmailSync } from "@/hooks/useGmailSync";
import { Email } from "@/types";

type InboxFilter = "all" | "received" | "sent";

export function AllEmailsScreen() {
  const navigation = useNavigation<any>();
  const { data: emails = [], isLoading } = useEmails();
  const { data: syncStatus } = useGmailSyncStatus();
  const triggerSync = useTriggerGmailSync();
  const [filter, setFilter] = React.useState<InboxFilter>("all");

  const threadList = React.useMemo(() => {
    const grouped = new Map<string, Email[]>();

    emails
      .filter((email) => {
        if (filter === "all") {
          return true;
        }
        if (filter === "sent") {
          return email.is_sent_by_me;
        }
        return !email.is_sent_by_me;
      })
      .forEach((email) => {
        const key = email.gmail_thread_id;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(email);
      });

    return Array.from(grouped.values())
      .map((threadEmails) => {
        const ordered = [...threadEmails].sort(
          (a, b) =>
            new Date(b.received_at ?? b.synced_at).getTime() -
            new Date(a.received_at ?? a.synced_at).getTime(),
        );
        const latest = ordered[0];
        return {
          threadId: latest.gmail_thread_id,
          subject: latest.subject ?? "No subject",
          counterpart: latest.is_sent_by_me ? latest.to_address : latest.from_address,
          preview: latest.body_preview,
          totalMessages: ordered.length,
          receivedAt: latest.received_at ?? latest.synced_at,
        };
      })
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [emails, filter]);

  const syncState = syncStatus?.sync_status ?? "idle";

  return (
    <ScreenContainer>
      <Text style={styles.title}>Unified Inbox</Text>

      <View style={styles.syncCard}>
        <View>
          <Text style={styles.syncLabel}>Gmail Sync</Text>
          <Text style={styles.syncStatus}>{syncState.toUpperCase()}</Text>
        </View>
        <Pressable
          style={styles.syncButton}
          onPress={() => triggerSync.mutate()}
          disabled={triggerSync.isPending}
        >
          <Text style={styles.syncButtonText}>
            {triggerSync.isPending ? "Syncing..." : "Sync now"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {(["all", "received", "sent"] as const).map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {item.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? <Text style={styles.emptyText}>Loading inbox...</Text> : null}

      <View style={styles.listWrap}>
        {threadList.map((thread) => (
          <Pressable
            key={thread.threadId}
            style={styles.threadCard}
            onPress={() => navigation.navigate("Thread", { threadId: thread.threadId })}
          >
            <View style={styles.threadHeader}>
              <Text style={styles.threadSubject} numberOfLines={1}>
                {thread.subject}
              </Text>
              <Text style={styles.threadDate}>
                {new Date(thread.receivedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <Text style={styles.threadCounterpart} numberOfLines={1}>
              {thread.counterpart ?? "Unknown"}
            </Text>
            <Text style={styles.threadPreview} numberOfLines={2}>
              {thread.preview ?? "No preview available"}
            </Text>
            <Text style={styles.threadCount}>{thread.totalMessages} messages</Text>
          </Pressable>
        ))}

        {!threadList.length && !isLoading ? (
          <Text style={styles.emptyText}>No threads match this filter.</Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  syncCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
  },
  syncLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  syncStatus: {
    marginTop: 3,
    color: theme.colors.text,
    fontWeight: "800",
  },
  syncButton: {
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  syncButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: "#e6edf7",
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  filterChipTextActive: {
    color: theme.colors.primary,
  },
  listWrap: {
    gap: 10,
  },
  threadCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  threadSubject: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  threadDate: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  threadCounterpart: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  threadPreview: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  threadCount: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "600",
  },
  emptyText: {
    color: theme.colors.muted,
  },
});
