import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { signInWithGoogle } from "@/services/auth";

export function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("Sign in failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️</Text>
      <Text style={styles.title}>BountyTrack</Text>
      <Text style={styles.tagline}>Track your bug bounties. Own your reports.</Text>
      <Pressable onPress={handleGoogleLogin} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Connecting..." : "Continue with Google"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 20,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: 12,
  },
  tagline: {
    fontSize: 15,
    color: theme.colors.muted,
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});
