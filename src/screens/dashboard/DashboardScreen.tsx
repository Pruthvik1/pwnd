import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Sparkline } from "@/components/charts/Sparkline";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatCard } from "@/components/StatCard";
import { theme } from "@/constants/theme";
import { useDashboard } from "@/hooks/useDashboard";
import { useEmails } from "@/hooks/useEmails";
import { useFreelanceEngagements } from "@/hooks/useFreelance";
import { useRealtimeBounties } from "@/hooks/useRealtimeBounties";
import { useBounties } from "@/hooks/useBounties";

export function DashboardScreen() {
  const { width } = useWindowDimensions();
  const { data, isLoading } = useDashboard();
  const { data: bounties = [] } = useBounties();
  const { data: emails = [] } = useEmails();
  const { data: freelance = [] } = useFreelanceEngagements();
  useRealtimeBounties();

  const trendData = React.useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString(undefined, { month: "short" }),
      };
    });

    const buckets = new Map<string, number>();
    months.forEach((month) => buckets.set(month.key, 0));

    bounties.forEach((bounty) => {
      if (!bounty.created_at) {
        return;
      }

      const created = new Date(bounty.created_at);
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      if (!buckets.has(key)) {
        return;
      }

      const value = Number(bounty.bounty_awarded ?? bounty.bounty_expected ?? 0);
      buckets.set(key, (buckets.get(key) ?? 0) + value);
    });

    return months.map((month) => ({
      label: month.label,
      value: buckets.get(month.key) ?? 0,
    }));
  }, [bounties]);

  const activityTimeline = React.useMemo(() => {
    const bountyEvents = bounties.slice(0, 8).map((item) => ({
      id: `bounty-${item.id}`,
      title: `${item.company_name}: ${item.status}`,
      subtitle: item.title,
      date: item.updated_at ?? item.created_at,
      type: "bounty" as const,
    }));

    const emailEvents = emails.slice(0, 8).map((item) => ({
      id: `email-${item.id}`,
      title: item.subject ?? "No subject",
      subtitle: item.from_address ?? "Unknown sender",
      date: item.received_at ?? item.synced_at,
      type: "email" as const,
    }));

    const freelanceEvents = freelance.slice(0, 8).map((item) => ({
      id: `freelance-${item.id}`,
      title: `${item.client_name}: ${item.stage.replace(/_/g, " ")}`,
      subtitle: item.title,
      date: item.updated_at ?? item.created_at,
      type: "freelance" as const,
    }));

    return [...bountyEvents, ...emailEvents, ...freelanceEvents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [bounties, emails, freelance]);

  if (isLoading || !data) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Dashboard</Text>
        <Text>Loading stats...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.heroCaption}>Available balance</Text>
        <Text style={styles.heroAmount}>${data.totalEarned.toFixed(2)}</Text>
        <View style={styles.heroActions}>
          <Pressable style={[styles.heroButton, styles.heroPrimaryButton]}>
            <Text style={styles.heroPrimaryLabel}>Send</Text>
          </Pressable>
          <Pressable style={styles.heroButton}>
            <Text style={styles.heroSecondaryLabel}>Request</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Total Earned" value={`$${data.totalEarned.toFixed(0)}`} />
        <StatCard label="Accepted" value={`${data.acceptedCount}`} />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Reports Sent" value={`${data.reportsSent}`} />
        <StatCard label="Pending Payout" value={`$${data.pendingPayout.toFixed(0)}`} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>6-Month Earnings Trend</Text>
          <Text style={styles.cardHint}>Live</Text>
        </View>
        <Sparkline points={trendData.map((item) => item.value)} width={Math.max(width - 84, 160)} height={72} />
        <View style={styles.monthRow}>
          {trendData.map((item) => (
            <Text key={item.label} style={styles.monthLabel}>
              {item.label}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Severity Breakdown</Text>
        <View style={styles.severityRow}>
          <SeverityBadge severity="critical" />
          <Text style={styles.count}>{data.severityCounts.critical}</Text>
          <SeverityBadge severity="high" />
          <Text style={styles.count}>{data.severityCounts.high}</Text>
          <SeverityBadge severity="medium" />
          <Text style={styles.count}>{data.severityCounts.medium}</Text>
          <SeverityBadge severity="low" />
          <Text style={styles.count}>{data.severityCounts.low}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Activity Feed</Text>
        {activityTimeline.length ? (
          <View style={styles.activityList}>
            {activityTimeline.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityDot, activity.type === "email" && styles.emailDot, activity.type === "freelance" && styles.freelanceDot]} />
                <View style={styles.activityBody}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>
                  {new Date(activity.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.cardText}>No realtime activity yet.</Text>
        )}
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
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  heroCaption: {
    color: "#d4e2ff",
    fontSize: 13,
    fontWeight: "600",
  },
  heroAmount: {
    color: theme.colors.white,
    fontSize: 34,
    fontWeight: "800",
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  heroButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingVertical: 10,
    alignItems: "center",
  },
  heroPrimaryButton: {
    backgroundColor: "#f4c542",
  },
  heroPrimaryLabel: {
    color: "#111827",
    fontWeight: "700",
  },
  heroSecondaryLabel: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHint: {
    color: theme.colors.accent,
    fontWeight: "700",
    fontSize: 12,
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  cardText: {
    marginTop: 8,
    color: theme.colors.muted,
  },
  severityRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  count: {
    marginRight: 8,
    color: theme.colors.text,
    fontWeight: "700",
  },
  activityList: {
    marginTop: 8,
    gap: 10,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  emailDot: {
    backgroundColor: theme.colors.accent,
  },
  freelanceDot: {
    backgroundColor: "#f4c542",
  },
  activityBody: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  activitySubtitle: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  activityTime: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
});
