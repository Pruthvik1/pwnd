import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { completeOnboarding, getCurrentSession } from "@/services/auth";

const STEPS = [
  {
    id: 1,
    emoji: "🐛",
    cardBg: "#1a237e",
    accentBg: "#283593",
    badge: "Bug Bounties",
    title: "Track every\nbounty report",
    description:
      "Log vulnerabilities, set severity levels, and never lose track of a submission again.",
    features: ["Severity tagging", "Status tracking", "Expected payout"],
  },
  {
    id: 2,
    emoji: "📬",
    cardBg: "#0d47a1",
    accentBg: "#1565c0",
    badge: "Gmail Sync",
    title: "Sync company\nreplies instantly",
    description:
      "Connect Gmail to pull in security@ threads automatically. See every response in one inbox.",
    features: ["Auto thread sync", "Unified inbox", "Reply from app"],
  },
  {
    id: 3,
    emoji: "💰",
    cardBg: "#1b5e20",
    accentBg: "#2e7d32",
    badge: "Earnings",
    title: "Get paid &\ntrack income",
    description:
      "Log payouts, visualise 6-month trends, and export CSV for tax season — all in one place.",
    features: ["Payout logging", "Earnings charts", "CSV export"],
  },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    handleComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const session = await getCurrentSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Missing user session. Please sign in again.");
      await completeOnboarding(userId);
    } catch (error) {
      Alert.alert("Setup failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: current.cardBg }]}>
          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: current.accentBg }]}>
            <Text style={styles.badgeText}>{current.badge}</Text>
          </View>

          {/* Emoji circle */}
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{current.emoji}</Text>
          </View>

          {/* Step counter */}
          <Text style={styles.stepCounter}>
            {step + 1} of {STEPS.length}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.heading}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>

          {/* Feature pills */}
          <View style={styles.pills}>
            {current.features.map((f) => (
              <View key={f} style={styles.pill}>
                <Text style={styles.pillText}>✓ {f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dots + CTA */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <Pressable
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.ctaText}>
              {loading ? "Setting up..." : isLast ? "Start tracking →" : "Next →"}
            </Text>
          </Pressable>

          {!isLast && (
            <Pressable onPress={handleComplete} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip setup</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    gap: 0,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 28,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 18,
    left: 18,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  stepCounter: {
    position: "absolute",
    top: 22,
    right: 18,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  emojiWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 48,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 10,
    flex: 1,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: theme.colors.primary,
    lineHeight: 36,
  },
  description: {
    fontSize: 15,
    color: theme.colors.muted,
    lineHeight: 22,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    gap: 14,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  cta: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingVertical: 4,
  },
  skipText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
});
