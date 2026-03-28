import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

interface Props {
  label: string;
  value: string;
}

export function StatCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 14,
    minWidth: 140,
  },
  label: {
    fontSize: 12,
    color: "#d4e2ff",
    fontWeight: "600",
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.white,
  },
});
