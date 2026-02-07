import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated } from 'react-native';
import { useColorScheme } from '@react-native-community/hooks';

interface LoadingSpinnerProps {
  visible: boolean;
  message?: string;
  delay?: number; // ms antes de mostrar (default 2000ms para latency > 2s)
  isDarkMode?: boolean;
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
    zIndex: 1000,
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    minWidth: 150,
  },
  containerDark: {
    backgroundColor: '#222',
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  messageDark: {
    color: '#e0e0e0',
  },
  messageLight: {
    color: '#333',
  },
  latencyWarning: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    opacity: 0.7,
  },
  latencyWarningDark: {
    color: '#ffc107',
  },
  latencyWarningLight: {
    color: '#ff9800',
  },
});

export function LoadingSpinner({
  visible,
  message = 'Cargando...',
  delay = 2000,
  isDarkMode,
}: LoadingSpinnerProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [showLatencyWarning, setShowLatencyWarning] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const isDark = isDarkMode !== undefined ? isDarkMode : colorScheme === 'dark';

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    if (visible) {
      // Mostrar spinner después del delay
      delayTimer = setTimeout(() => {
        setShouldShow(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, delay);

      // Mostrar warning después de 5 segundos de carga
      warningTimer = setTimeout(() => {
        if (shouldShow) {
          setShowLatencyWarning(true);
        }
      }, 5000);
    } else {
      setShouldShow(false);
      setShowLatencyWarning(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(warningTimer);
    };
  }, [visible, delay, fadeAnim, shouldShow]);

  if (!shouldShow && !visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        isDark ? styles.overlayDark : styles.overlayLight,
        { opacity: fadeAnim },
        { pointerEvents: shouldShow ? 'auto' : 'none' },
      ]}
    >
      <View
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? '#4CAF50' : '#2E7D32'}
            animating={visible}
          />
        </View>

        {message && (
          <Text
            style={[
              styles.message,
              isDark ? styles.messageDark : styles.messageLight,
            ]}
          >
            {message}
          </Text>
        )}

        {showLatencyWarning && (
          <Text
            style={[
              styles.latencyWarning,
              isDark
                ? styles.latencyWarningDark
                : styles.latencyWarningLight,
            ]}
          >
            La conexión es lenta. Por favor espera...
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Hook para facilitar el uso del spinner
 * Retorna { show, hide, isVisible }
 */
export function useLoadingSpinner(defaultDelay = 2000) {
  const [isVisible, setIsVisible] = useState(false);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    show,
    hide,
    delay: defaultDelay,
    component: <LoadingSpinner visible={isVisible} delay={defaultDelay} />,
  };
}

/**
 * Mini spinner para integración en endpoints
 * Usa GlobalErrorStore para mostrar latencia
 */
export function MiniLoadingSpinner({
  visible = false,
  isDarkMode,
}: Omit<LoadingSpinnerProps, 'message' | 'delay'>) {
  return (
    <LoadingSpinner
      visible={visible}
      message="Cargando..."
      delay={1500}
      isDarkMode={isDarkMode}
    />
  );
}
