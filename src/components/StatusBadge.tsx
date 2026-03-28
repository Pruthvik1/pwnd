import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { BountyStatus } from '@/types';

interface Props {
  status: BountyStatus;
}

export function StatusBadge({ status }: Props) {
  const colors = theme.status[status];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}> 
      <Text style={[styles.text, { color: colors.text }]}>{status.replace('_', ' ').toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
