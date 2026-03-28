import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useFreelanceEngagements } from "@/hooks/useFreelance";

interface FreelanceRouteParams {
  engagementId: string;
}

export function FreelanceDetailScreen() {
  const route = useRoute<any>();
  const { engagementId } = route.params as FreelanceRouteParams;
  const { data: engagements = [] } = useFreelanceEngagements();

  const engagement = engagements.find((item) => item.id === engagementId);

  return (
    <ScreenContainer>
      {!engagement ? (
        <Text style={styles.empty}>Engagement not found.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.client}>{engagement.client_name}</Text>
          <Text style={styles.title}>{engagement.title}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Stage</Text>
            <Text style={styles.value}>{engagement.stage.replace(/_/g, " ")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment</Text>
            <Text style={styles.value}>{engagement.payment_status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expected value</Text>
            <Text style={styles.value}>${Number(engagement.expected_value ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agreed value</Text>
            <Text style={styles.value}>${Number(engagement.agreed_value ?? 0).toFixed(2)}</Text>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 10,
  },
  client: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  title: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  value: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },
  empty: {
    color: theme.colors.muted,
  },
});
