import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { PushNotificationProvider } from '@/contexts/PushNotificationContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
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
