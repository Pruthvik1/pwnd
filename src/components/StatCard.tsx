import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

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
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    minWidth: 140,
  },
  label: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
