/**
 * Firebase Cloud Messaging Integration
 * Token registration, push notifications, push notification listening
 */

import * as Notifications from 'expo-notifications';
import { api } from '../shared/api';
import { ENDPOINTS } from '../shared/config';
import { logger } from '../utils/logger';

/**
 * Configure push notifications
 */
export async function setupPushNotifications() {
  try {
    const { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        logger.warn('Push notification permission denied');
        return;
      }
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        logger.debug('Notification received:', notification.request.content);
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });

    logger.info('Push notifications configured');
  } catch (error) {
    logger.error('Failed to setup push notifications:', error);
  }
}

/**
 * Register FCM token with backend
 */
export async function registerFCMToken(): Promise<string | null> {
  try {
    logger.info('Registering FCM token...');

    // Get device token
    const token = await Notifications.getExpoPushTokenAsync();
    const deviceToken = token.data;

    logger.debug('Device token:', deviceToken);

    // Register with backend
    const response = await api.post(ENDPOINTS.FCM.REGISTER_TOKEN, {
      token: deviceToken,
      platform: 'expo',
      app_version: '2.0.0',
    });

    logger.info('FCM token registered successfully');
    return deviceToken;
  } catch (error) {
    logger.error('Failed to register FCM token:', error);
    return null;
  }
}

/**
 * Listen for incoming push notifications
 */
export function setupPushNotificationListener(
  onNotification: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    logger.debug('Notification response received:', response);
    onNotification(response.notification);
  });

  return () => {
    subscription.remove();
  };
}

/**
 * Send local notification for testing
 */
export async function sendLocalNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
    logger.debug('Local notification scheduled');
  } catch (error) {
    logger.error('Failed to schedule local notification:', error);
  }
}

/**
 * Unregister FCM token (on logout)
 */
export async function unregisterFCMToken(): Promise<void> {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    await api.post(ENDPOINTS.FCM.UNREGISTER_TOKEN, {
      token: token.data,
    });
    logger.info('FCM token unregistered');
  } catch (error) {
    logger.warn('Failed to unregister FCM token:', error);
  }
}
