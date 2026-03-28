import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useFreelanceEngagements } from "@/hooks/useFreelance";

export function FreelanceListScreen() {
  const navigation = useNavigation<any>();
  const { data: engagements = [], isLoading } = useFreelanceEngagements();

  const stageCounts = React.useMemo(
    () =>
      engagements.reduce(
        (acc, item) => {
          acc[item.stage] = (acc[item.stage] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [engagements],
  );

  const pipelineStages = ["lead", "proposal_sent", "negotiating", "in_progress", "closed_won"];

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Freelance Pipeline</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddFreelance")}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.pipelineWrap}>
        {pipelineStages.map((stage) => (
          <View key={stage} style={styles.stageChip}>
            <Text style={styles.stageLabel}>{stage.replace(/_/g, " ")}</Text>
            <Text style={styles.stageValue}>{stageCounts[stage] ?? 0}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Client engagements</Text>
        {isLoading ? <Text style={styles.empty}>Loading pipeline...</Text> : null}

        {engagements.map((engagement) => (
          <Pressable
            key={engagement.id}
            style={styles.engagementCard}
            onPress={() => navigation.navigate("FreelanceDetail", { engagementId: engagement.id })}
          >
            <View style={styles.engagementHead}>
              <Text style={styles.clientName}>{engagement.client_name}</Text>
              <Text style={styles.stageBadge}>{engagement.stage.replace(/_/g, " ")}</Text>
            </View>
            <Text style={styles.engagementTitle}>{engagement.title}</Text>
            <View style={styles.moneyRow}>
              <Text style={styles.moneyLabel}>Expected</Text>
              <Text style={styles.moneyValue}>
                ${Number(engagement.expected_value ?? 0).toFixed(2)}
              </Text>
            </View>
          </Pressable>
        ))}

        {!engagements.length && !isLoading ? (
          <Text style={styles.empty}>
            No freelance clients yet. Add your first lead to start pipeline tracking.
          </Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  pipelineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stageChip: {
    width: "48%",
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  stageLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    textTransform: "capitalize",
  },
  stageValue: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  sectionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  engagementCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  engagementHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientName: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  stageBadge: {
    color: theme.colors.primary,
    backgroundColor: "#e6edf7",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  engagementTitle: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  moneyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moneyLabel: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  moneyValue: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  empty: {
    color: theme.colors.muted,
    fontSize: 12,
  },
});
