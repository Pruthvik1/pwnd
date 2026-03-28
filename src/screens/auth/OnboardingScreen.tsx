import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { completeOnboarding, getCurrentSession } from "@/services/auth";

export function OnboardingScreen() {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const session = await getCurrentSession();
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("Missing user session. Please sign in again.");
      }
      await completeOnboarding(userId);
    } catch (error) {
      Alert.alert("Setup failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to BountyTrack</Text>
      <Text style={styles.item}>1. Connect Gmail to sync company replies</Text>
      <Text style={styles.item}>2. Add your first bug bounty or freelance client</Text>
      <Text style={styles.item}>3. Track threads, payouts, and stale follow-ups</Text>

      <Pressable onPress={handleComplete} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Get Started"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.surface,
    gap: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    color: theme.colors.text,
  },
  button: {
    marginTop: 20,
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
});
