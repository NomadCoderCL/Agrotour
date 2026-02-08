import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from '@stripe/stripe-react-native';
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SyncProvider } from "@/contexts/SyncContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { PushNotificationProvider } from "@/contexts/PushNotificationContext";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ErrorToast } from "@/components/ErrorToast";

export const unstable_settings = {
  anchor: "(tabs)",
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
  <StripeProvider
    publishableKey="pk_test_51Q59wF2N3O4aV8Z6qL9iX7jR1K2m3n4o5p6q7r8s9t0" // Replace with env var later
    merchantIdentifier="merchant.com.nomadcodercl.agrotour" // optional
  >
    <DarkModeProvider>
      <AuthProvider>
        <CartProvider>
          <SyncProvider>
            <PushNotificationProvider>
              <RootLayoutContent />
              <StatusBar style="auto" />
            </PushNotificationProvider>
          </SyncProvider>
        </CartProvider>
      </AuthProvider>
    </DarkModeProvider>
  </StripeProvider>
}
