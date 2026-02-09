import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  useColorScheme,
} from 'react-native';

export interface RetryConfig {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  backoffMs?: number;
  autoRetry?: boolean;
  autoRetryDelay?: number;
}

interface RetryHandlerProps {
  visible: boolean;
  config: RetryConfig;
  title?: string;
  subtitle?: string;
  isDarkMode?: boolean;
  onSuccess?: () => void;
  onFailure?: () => void;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  overlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  container: {
    borderRadius: 12,
    padding: 24,
    minWidth: '70%',
    maxWidth: '90%',
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#1e1e1e',
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  titleDark: {
    color: '#fff',
  },
  titleLight: {
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#e0e0e0',
  },
  subtitleLight: {
    color: '#666',
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  retryStatus: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryStatusDark: {
    color: '#ccc',
  },
  retryStatusLight: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  dismissButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  failureMessage: {
    fontSize: 13,
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export function RetryHandler({
  visible,
  config,
  title = 'Error de conexión',
  subtitle = 'No se pudo completar la operación',
  isDarkMode,
  onSuccess,
  onFailure,
}: RetryHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasFailedMax, setHasFailedMax] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const isDark = isDarkMode !== undefined ? isDarkMode : colorScheme === 'dark';

  const maxRetries = config.maxRetries || 3;
  const autoRetryDelay = config.autoRetryDelay || 5000;

  // Auto-retry logic
  useEffect(() => {
    if (!visible || !config.autoRetry) return;

    if (retryCount > 0 && retryCount < maxRetries && !isRetrying) {
      const countdownInterval = setInterval(() => {
        setAutoRetryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleRetry(); // Auto-retry
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setAutoRetryCountdown(Math.ceil(autoRetryDelay / 1000));
      return () => clearInterval(countdownInterval);
    }
  }, [visible, config.autoRetry, retryCount, isRetrying, maxRetries]);

  // Fade animation
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Reset state cuando se cierra
      setTimeout(() => {
        setRetryCount(0);
        setHasFailedMax(false);
        setAutoRetryCountdown(0);
      }, 300);
    }
  }, [visible, fadeAnim]);

  const handleRetry = async () => {
    if (isRetrying || retryCount >= maxRetries) return;

    setIsRetrying(true);

    try {
      await config.onRetry();
      setRetryCount(0);
      setHasFailedMax(false);
      onSuccess?.();
    } catch (err) {
      const newCount = retryCount + 1;
      setRetryCount(newCount);

      if (newCount >= maxRetries) {
        setHasFailedMax(true);
        onFailure?.();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setRetryCount(0);
    setHasFailedMax(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        isDark ? styles.overlayDark : styles.overlayLight,
        { opacity: fadeAnim },
      ]}
    >
      <View
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        <Text
          style={[
            styles.title,
            isDark ? styles.titleDark : styles.titleLight,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.subtitle,
            isDark ? styles.subtitleDark : styles.subtitleLight,
          ]}
        >
          {subtitle}
        </Text>

        {hasFailedMax && (
          <Text style={styles.failureMessage}>
            No se pudo completar la operación después de {maxRetries} intentos.
            Por favor, intenta más tarde.
          </Text>
        )}

        {isRetrying && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator
              size="small"
              color={isDark ? '#4CAF50' : '#2E7D32'}
            />
          </View>
        )}

        {!isRetrying && retryCount > 0 && !hasFailedMax && (
          <Text
            style={[
              styles.retryStatus,
              isDark ? styles.retryStatusDark : styles.retryStatusLight,
            ]}
          >
            Intento {retryCount} de {maxRetries}
            {autoRetryCountdown > 0 && ` (reintentar en ${autoRetryCountdown}s)`}
          </Text>
        )}

        {!hasFailedMax && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={handleRetry}
              disabled={isRetrying || retryCount >= maxRetries}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {retryCount === 0 ? 'Reintentar' : 'Intentar de nuevo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={handleDismiss}
              disabled={isRetrying}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasFailedMax && (
          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Hook para manejar retry automático
 */
export function useRetryHandler(config: RetryConfig) {
  const [isVisible, setIsVisible] = useState(false);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    show,
    hide,
    config,
    component: <RetryHandler visible={isVisible} config={config} />,
  };
}

/**
 * Ejecutaor de operación con reintentos automáticos
 * Maneja el flujo completo: intento -> retry -> max retries
 */
export async function executeWithRetry(
  operation: () => Promise<void>,
  maxRetries = 3,
  backoffMs = 1000
): Promise<void> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await operation();
      return;
    } catch (err) {
      lastError = err as Error;
      if (i < maxRetries - 1) {
        // Esperar antes de reintentar (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, backoffMs * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
