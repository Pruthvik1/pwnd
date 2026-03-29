import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { AppTabIcon } from "@/components/icons/AppTabIcon";
import { theme } from "@/constants/theme";
import { getCurrentSession, isOnboardingCompleted } from "@/services/auth";
import { hasSupabaseConfig, requireSupabase } from "@/services/supabase";
import { AuthScreen } from "@/screens/auth/AuthScreen";
import { OnboardingScreen } from "@/screens/auth/OnboardingScreen";
import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { BountyListScreen } from "@/screens/bounties/BountyListScreen";
import { BountyDetailScreen } from "@/screens/bounties/BountyDetailScreen";
import { AddBountyScreen } from "@/screens/bounties/AddBountyScreen";
import { AllEmailsScreen } from "@/screens/emails/AllEmailsScreen";
import { ThreadScreen } from "@/screens/emails/ThreadScreen";
import { EarningsScreen } from "@/screens/earnings/EarningsScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { FreelanceListScreen } from "@/screens/freelance/FreelanceListScreen";
import { FreelanceDetailScreen } from "@/screens/freelance/FreelanceDetailScreen";
import { AddFreelanceScreen } from "@/screens/freelance/AddFreelanceScreen";
import {
  AuthStackParamList,
  BountiesStackParamList,
  EmailsStackParamList,
  FreelanceStackParamList,
  RootTabParamList,
} from "@/navigation/types";

const AuthStack = createStackNavigator<AuthStackParamList>();
const BountiesStack = createStackNavigator<BountiesStackParamList>();
const EmailsStack = createStackNavigator<EmailsStackParamList>();
const FreelanceStack = createStackNavigator<FreelanceStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

function BountiesStackNavigator() {
  return (
    <BountiesStack.Navigator>
      <BountiesStack.Screen
        name="BountyList"
        component={BountyListScreen}
        options={{ title: "Bounties" }}
      />
      <BountiesStack.Screen
        name="BountyDetail"
        component={BountyDetailScreen}
        options={{ title: "Bounty Detail" }}
      />
      <BountiesStack.Screen
        name="AddBounty"
        component={AddBountyScreen}
        options={{ title: "Add Bounty" }}
      />
    </BountiesStack.Navigator>
  );
}

function EmailsStackNavigator() {
  return (
    <EmailsStack.Navigator>
      <EmailsStack.Screen
        name="AllEmails"
        component={AllEmailsScreen}
        options={{ title: "All Emails" }}
      />
      <EmailsStack.Screen name="Thread" component={ThreadScreen} options={{ title: "Thread" }} />
    </EmailsStack.Navigator>
  );
}

function FreelanceStackNavigator() {
  return (
    <FreelanceStack.Navigator>
      <FreelanceStack.Screen
        name="FreelanceList"
        component={FreelanceListScreen}
        options={{ title: "Freelance" }}
      />
      <FreelanceStack.Screen
        name="FreelanceDetail"
        component={FreelanceDetailScreen}
        options={{ title: "Freelance Detail" }}
      />
      <FreelanceStack.Screen
        name="AddFreelance"
        component={AddFreelanceScreen}
        options={{ title: "Add Freelance" }}
      />
    </FreelanceStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <AppTabIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="BountiesTab"
        component={BountiesStackNavigator}
        options={{
          title: "Bounties",
          tabBarIcon: ({ color }) => <AppTabIcon name="bounties" color={color} />,
        }}
      />
      <Tabs.Screen
        name="EmailsTab"
        component={EmailsStackNavigator}
        options={{
          title: "Emails",
          tabBarIcon: ({ color }) => <AppTabIcon name="emails" color={color} />,
        }}
      />
      <Tabs.Screen
        name="FreelanceTab"
        component={FreelanceStackNavigator}
        options={{
          title: "Freelance",
          tabBarIcon: ({ color }) => <AppTabIcon name="freelance" color={color} />,
        }}
      />
      <Tabs.Screen
        name="EarningsTab"
        component={EarningsScreen}
        options={{
          title: "Earnings",
          tabBarIcon: ({ color }) => <AppTabIcon name="earnings" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <AppTabIcon name="profile" color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      <AuthStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ title: "Welcome" }}
      />
    </AuthStack.Navigator>
  );
}

export function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const supabase = requireSupabase();

    const bootstrap = async () => {
      try {
        const session = await getCurrentSession();
        const hasSession = Boolean(session?.user);

        if (!mounted) {
          return;
        }

        setIsAuthenticated(hasSession);

        if (session?.user?.id) {
          try {
            const completed = await isOnboardingCompleted(session.user.id);
            if (mounted) {
              setNeedsOnboarding(!completed);
            }
          } catch (error) {
            if (mounted) {
              setNeedsOnboarding(false);
            }
            console.warn("Onboarding status unavailable. Did you run Supabase migrations?", error);
          }
        }
      } catch (error) {
        if (mounted) {
          setIsAuthenticated(false);
          setNeedsOnboarding(false);
        }
        console.warn("Auth bootstrap failed", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const hasSession = Boolean(session?.user);
      setIsAuthenticated(hasSession);
      if (!session?.user?.id) {
        setNeedsOnboarding(false);
        return;
      }

      try {
        const completed = await isOnboardingCompleted(session.user.id);
        setNeedsOnboarding(!completed);
      } catch (error) {
        setNeedsOnboarding(false);
        console.warn("Onboarding status unavailable after auth state change", error);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadingNode = useMemo(
    () => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.white,
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={{ marginTop: 12, color: theme.colors.muted }}>Loading BountyTrack...</Text>
      </View>
    ),
    [],
  );

  if (!hasSupabaseConfig) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: theme.colors.white,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", color: theme.colors.primary }}>
          BountyTrack
        </Text>
        <Text style={{ marginTop: 12, fontSize: 16, color: theme.colors.text }}>
          Supabase is not configured yet.
        </Text>
        <Text style={{ marginTop: 8, color: theme.colors.muted }}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file, then
          restart Expo.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return loadingNode;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStackNavigator />
      ) : needsOnboarding ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
        </AuthStack.Navigator>
      ) : (
        <MainTabs />
      )}
    </NavigationContainer>
  );
}
