import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { Severity } from '@/types';

interface Props {
  severity: Severity | null;
}

export function SeverityBadge({ severity }: Props) {
  if (!severity) {
    return null;
  }

  const colors = theme.severity[severity];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}> 
      <Text style={[styles.text, { color: colors.text }]}>{severity.toUpperCase()}</Text>
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
