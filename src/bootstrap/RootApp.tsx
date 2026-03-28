import "react-native-url-polyfill/auto";
import "@/global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";

import { AppNavigator } from "@/navigation/AppNavigator";

export default function RootApp() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <QueryClientProvider client={queryClient}>
            <AppNavigator />
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
