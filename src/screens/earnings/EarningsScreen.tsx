import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { BarChart } from "@/components/charts/BarChart";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useEarnings } from "@/hooks/useEarnings";

export function EarningsScreen() {
  const { data, isLoading } = useEarnings();

  const monthlyData = React.useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString(undefined, { month: "short" }),
      };
    });

    const totals = new Map<string, number>();
    months.forEach((month) => totals.set(month.key, 0));

    (data?.payouts ?? []).forEach((payout) => {
      if (!payout.paid_at) {
        return;
      }

      const date = new Date(payout.paid_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!totals.has(key)) {
        return;
      }

      totals.set(key, (totals.get(key) ?? 0) + Number(payout.amount ?? 0));
    });

    return months.map((month) => ({ label: month.label, value: totals.get(month.key) ?? 0 }));
  }, [data?.payouts]);

  const exportCsv = async () => {
    const headers = ["paid_at", "amount", "currency", "payment_method", "notes"];
    const rows = (data?.payouts ?? []).map((payout) => [
      payout.paid_at ?? "",
      payout.amount,
      payout.currency,
      payout.payment_method,
      (payout.notes ?? "").replaceAll(",", " "),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    await Share.share({
      title: "BountyTrack payouts CSV",
      message: csv,
    });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total payouts</Text>
        <Text style={styles.totalValue}>${Number(data?.totalPaid ?? 0).toFixed(2)}</Text>
        <Pressable style={styles.exportButton} onPress={exportCsv}>
          <Text style={styles.exportText}>Export CSV</Text>
        </Pressable>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>6-Month payout chart</Text>
        <BarChart data={monthlyData} color={theme.colors.accent} />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Payout list</Text>
        {isLoading ? <Text style={styles.empty}>Loading payouts...</Text> : null}

        {(data?.payouts ?? []).map((payout) => (
          <View key={payout.id} style={styles.payoutRow}>
            <View>
              <Text style={styles.method}>{payout.payment_method}</Text>
              <Text style={styles.date}>{payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : "Pending"}</Text>
            </View>
            <Text style={styles.amount}>
              {payout.currency} {Number(payout.amount).toFixed(2)}
            </Text>
          </View>
        ))}

        {!data?.payouts?.length && !isLoading ? <Text style={styles.empty}>No payouts recorded yet.</Text> : null}
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
  totalCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  totalLabel: {
    color: "#d4e2ff",
    fontSize: 12,
    fontWeight: "600",
  },
  totalValue: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "800",
  },
  exportButton: {
    marginTop: 2,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#f4c542",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exportText: {
    color: "#111827",
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  listCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 10,
  },
  method: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  date: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  amount: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  empty: {
    color: theme.colors.muted,
  },
});
