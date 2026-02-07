import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { initializeSqliteDB } from "@/services/SqliteDB";
import { AuthProvider } from "@/contexts/AuthContextV2";
import { CartProvider } from "@/contexts/CartContextV2";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { PushNotificationProvider } from "@/contexts/PushNotificationContext";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ErrorToast } from "@/components/ErrorToast";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutContent() {
  useEffect(() => {
    initializeSqliteDB()
      .then(() => console.log("[RootLayout] SQLite initialized"))
      .catch((err) => console.error("[RootLayout] SQLite failed:", err));
  }, []);

  return (
    <GlobalErrorBoundary>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <ErrorToast />
    </GlobalErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <CartProvider>
          <PushNotificationProvider>
            <RootLayoutContent />
            <StatusBar style="auto" />
          </PushNotificationProvider>
        </CartProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}
