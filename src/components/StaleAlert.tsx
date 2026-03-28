import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

interface Props {
  daysWithoutReply: number;
}

export function StaleAlert({ daysWithoutReply }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{daysWithoutReply} days without reply</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.warningBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    color: theme.colors.warning,
    fontSize: 11,
    fontWeight: '600',
  },
});
