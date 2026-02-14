import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from '@stripe/stripe-react-native';
import "react-native-reanimated";

import { AppProviders } from "@/contexts/AppProviders"; // 1. Importar AppProviders
import { SyncProvider } from "@/contexts/SyncContext";
import { PushNotificationProvider } from "@/contexts/PushNotificationContext";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ErrorToast } from "@/components/ErrorToast";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootLayoutContent() {
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
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.nomadcodercl.agrotour" // Opcional
    >
      {/* 2. Usar el componente centralizado de providers */}
      <AppProviders>
        <SyncProvider>
          <PushNotificationProvider>
            <RootLayoutContent />
            <StatusBar style="auto" />
          </PushNotificationProvider>
        </SyncProvider>
      </AppProviders>
    </StripeProvider>
  );
}
