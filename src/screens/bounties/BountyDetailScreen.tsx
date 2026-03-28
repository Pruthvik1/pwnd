import React from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

import { SeverityBadge } from "@/components/SeverityBadge";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { StatusBadge } from "@/components/StatusBadge";
import { theme } from "@/constants/theme";
import { useBountyById, useMarkBountyPaid, useUpdateBountyStatus } from "@/hooks/useBounties";
import { BountiesStackParamList } from "@/navigation/types";
import { BountyStatus } from "@/types";

export function BountyDetailScreen() {
  const route = useRoute<RouteProp<BountiesStackParamList, "BountyDetail">>();
  const { bountyId } = route.params;

  const { data: bounty, isLoading } = useBountyById(bountyId);
  const updateStatus = useUpdateBountyStatus();
  const markPaid = useMarkBountyPaid();
  const [awardInput, setAwardInput] = React.useState("0");

  React.useEffect(() => {
    if (bounty?.bounty_awarded != null) {
      setAwardInput(String(bounty.bounty_awarded));
    }
  }, [bounty?.bounty_awarded]);

  const onSetStatus = async (status: BountyStatus) => {
    try {
      await updateStatus.mutateAsync({ bountyId, status });
    } catch (error) {
      Alert.alert(
        "Status update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const onMarkPaid = async () => {
    const amount = Number(awardInput) || 0;
    if (amount <= 0) {
      Alert.alert("Invalid amount", "Enter awarded amount before marking as paid.");
      return;
    }
    try {
      await markPaid.mutateAsync({ bountyId, amount });
    } catch (error) {
      Alert.alert("Mark paid failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  if (isLoading || !bounty) {
    return (
      <ScreenContainer>
        <Text>Loading bounty details...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{bounty.company_name}</Text>
      <Text style={styles.subtitle}>{bounty.title}</Text>

      <View style={styles.row}>
        <SeverityBadge severity={bounty.severity} />
        <StatusBadge status={bounty.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.text}>{bounty.description ?? "No description added."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>POC Notes</Text>
        <Text style={styles.text}>{bounty.poc_notes ?? "No POC notes yet."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusWrap}>
          {(
            ["reported", "triaging", "accepted", "duplicate", "rejected", "paid"] as BountyStatus[]
          ).map((status) => (
            <Pressable key={status} style={styles.statusChip} onPress={() => onSetStatus(status)}>
              <Text style={styles.statusText}>{status.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Awarded Amount</Text>
        <TextInput
          style={styles.input}
          value={awardInput}
          onChangeText={setAwardInput}
          keyboardType="numeric"
        />
        <Pressable style={styles.payButton} onPress={onMarkPaid} disabled={markPaid.isPending}>
          <Text style={styles.payButtonText}>
            {markPaid.isPending ? "Saving..." : "Mark as Paid"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Gmail Thread</Text>
        <Text style={styles.text}>{bounty.gmail_thread_id ?? "No thread linked yet."}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.muted,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  text: {
    color: theme.colors.muted,
  },
  statusWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  payButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  payButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
});
