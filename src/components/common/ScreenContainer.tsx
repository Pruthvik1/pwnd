import React, { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";

import { theme } from "@/constants/theme";

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: 16,
    gap: 12,
  },
});
