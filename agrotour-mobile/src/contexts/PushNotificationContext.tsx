/**
 * Push Notifications Context Provider
 * Initializes FCM and handles push notification events
 */

import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  setupPushNotifications,
  registerFCMToken,
  setupPushNotificationListener,
  unregisterFCMToken,
} from '../services/fcm';
import { getLogger } from '../shared/logger';

const logger = getLogger('PushNotificationProvider');

interface PushNotificationContextType {
  isReady: boolean;
  error: string | null;
}

const PushNotificationContext = React.createContext<PushNotificationContextType | undefined>(
  undefined
);

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        // Setup notification handler
        await setupPushNotifications();

        // Register FCM token if user is logged in
        if (user?.id) {
          const token = await registerFCMToken();
          if (token) {
            logger.info('FCM token registered:', token);
          }
        }

        // Setup listener for incoming notifications
        const unsubscribe = setupPushNotificationListener((notification) => {
          logger.debug('Notification received:', notification);
          // Handle notification - show toast, navigate, etc.
        });

        setIsReady(true);

        // Cleanup on unmount or logout
        return () => {
          unsubscribe();
          if (user?.id) {
            unregisterFCMToken().catch((err) => logger.warn('Failed to unregister FCM:', err));
          }
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        logger.error('Failed to initialize push notifications:', err);
        setIsReady(true); // Still set ready even if push fails
      }
    };

    initPushNotifications();
  }, [user?.id]);

  return (
    <PushNotificationContext.Provider value={{ isReady, error }}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications(): PushNotificationContextType {
  const context = React.useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotifications must be used within PushNotificationProvider');
  }
  return context;
}
