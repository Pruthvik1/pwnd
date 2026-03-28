import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useEmails } from "@/hooks/useEmails";

interface ThreadRouteParams {
  threadId: string;
}

export function ThreadScreen() {
  const route = useRoute<any>();
  const { threadId } = route.params as ThreadRouteParams;
  const { data: emails = [] } = useEmails();
  const [draft, setDraft] = React.useState("");

  const threadMessages = React.useMemo(
    () =>
      emails
        .filter((email) => email.gmail_thread_id === threadId)
        .sort(
          (a, b) =>
            new Date(a.received_at ?? a.synced_at).getTime() -
            new Date(b.received_at ?? b.synced_at).getTime(),
        ),
    [emails, threadId],
  );

  const latest = threadMessages[threadMessages.length - 1];

  return (
    <ScreenContainer>
      <Text style={styles.title}>{latest?.subject ?? "Thread"}</Text>
      <Text style={styles.subtitle}>Thread ID: {threadId}</Text>

      <View style={styles.timelineWrap}>
        {threadMessages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.is_sent_by_me ? styles.sentBubble : styles.receivedBubble,
            ]}
          >
            <Text style={styles.messageMeta}>
              {message.is_sent_by_me ? "You" : (message.from_address ?? "Unknown")}
            </Text>
            <Text style={styles.messageText}>{message.body_preview ?? "No message preview"}</Text>
            <Text style={styles.messageTime}>
              {new Date(message.received_at ?? message.synced_at).toLocaleString()}
            </Text>
          </View>
        ))}

        {!threadMessages.length ? (
          <Text style={styles.empty}>No messages available for this thread.</Text>
        ) : null}
      </View>

      <View style={styles.composerCard}>
        <Text style={styles.composerTitle}>Reply draft</Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={draft}
          onChangeText={setDraft}
          placeholder="Write your reply here..."
          style={styles.input}
        />
        <Pressable style={styles.sendButton}>
          <Text style={styles.sendText}>Save draft</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  timelineWrap: {
    gap: 10,
  },
  messageBubble: {
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
  },
  sentBubble: {
    backgroundColor: "#e6edf7",
    borderColor: "#d6e3f8",
  },
  receivedBubble: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
  },
  messageMeta: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 13,
  },
  messageTime: {
    color: theme.colors.muted,
    fontSize: 11,
  },
  composerCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  composerTitle: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
    textAlignVertical: "top",
    color: theme.colors.text,
  },
  sendButton: {
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    paddingVertical: 10,
  },
  sendText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  empty: {
    color: theme.colors.muted,
  },
});
