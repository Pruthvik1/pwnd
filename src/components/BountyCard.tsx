import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SeverityBadge } from '@/components/SeverityBadge';
import { StaleAlert } from '@/components/StaleAlert';
import { StatusBadge } from '@/components/StatusBadge';
import { theme } from '@/constants/theme';
import { Bounty } from '@/types';

interface Props {
  bounty: Bounty;
  onPress: () => void;
}

function getDaysSince(date: string | null) {
  if (!date) {
    return 0;
  }
  const diffMs = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function BountyCard({ bounty, onPress }: Props) {
  const daysSinceReported = getDaysSince(bounty.reported_at);
  const daysSinceLastEmail = getDaysSince(bounty.last_email_at ?? bounty.reported_at);
  const isStale =
    daysSinceLastEmail >= bounty.stale_after_days && !['paid', 'rejected'].includes(bounty.status);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.rowTop}>
        <Text style={styles.company}>{bounty.company_name}</Text>
        <Text style={styles.amount}>${Number(bounty.bounty_awarded ?? bounty.bounty_expected ?? 0).toFixed(0)}</Text>
      </View>

      <Text style={styles.title}>{bounty.title}</Text>

      <View style={styles.badgesRow}>
        <SeverityBadge severity={bounty.severity} />
        <StatusBadge status={bounty.status} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.meta}>Type: {bounty.vulnerability_type ?? 'Unknown'}</Text>
        <Text style={styles.meta}>{daysSinceReported} days since reported</Text>
      </View>

      {isStale ? <StaleAlert daysWithoutReply={daysSinceLastEmail} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  company: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  amount: {
    color: theme.colors.success,
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
    color: theme.colors.muted,
  },
});
