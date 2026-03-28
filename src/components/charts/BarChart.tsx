import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  color?: string;
}

export function BarChart({ data, color = theme.colors.primary }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const heightPercent = (item.value / maxValue) * 100;

        return (
          <View style={styles.barItem} key={item.label}>
            <Text style={styles.barValue}>${item.value.toFixed(0)}</Text>
            <View style={styles.barTrack}>
              <View
                style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: color }]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barTrack: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#e6edf7",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 12,
    minHeight: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.text,
  },
  barLabel: {
    fontSize: 11,
    color: theme.colors.muted,
    fontWeight: "600",
  },
});
