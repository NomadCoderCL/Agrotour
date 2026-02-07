/**
 * UI Components - Shared components para todas las screens
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDarkMode } from '../contexts/DarkModeContext';

// Loading Spinner
export function LoadingSpinner({ size = 'large', color = '#10b981' }: { size?: 'small' | 'large'; color?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

// Error Message
export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useDarkMode();

  return (
    <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.errorText, { color: colors.error }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Offline Indicator
export function OfflineIndicator({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) return null;

  return (
    <View style={[styles.offlineIndicator, { backgroundColor: '#ef4444' }]}>
      <Text style={styles.offlineText}>📡 Sin conexión</Text>
    </View>
  );
}

// Product Card
export function ProductCard({
  id,
  nombre,
  precio,
  onPress,
}: {
  id: number;
  nombre: string;
  precio: number;
  onPress: () => void;
}) {
  const { colors } = useDarkMode();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.cardImage}>
        <Text style={{ fontSize: 24 }}>🌾</Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {nombre}
      </Text>
      <Text style={[styles.cardPrice, { color: colors.primary }]}>CLP ${precio.toLocaleString()}</Text>
    </TouchableOpacity>
  );
}

// Button
export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const { colors } = useDarkMode();

  const buttonColor = {
    primary: colors.primary,
    secondary: colors.surface,
    danger: colors.error,
  }[variant];

  const buttonTextColor = {
    primary: colors.background,
    secondary: colors.text,
    danger: '#ffffff',
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonColor,
          opacity: disabled || loading ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={buttonTextColor} />
      ) : (
        <Text style={[styles.buttonText, { color: buttonTextColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// Input Field
export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}) {
  const { colors } = useDarkMode();

  return (
    <View
      style={[
        styles.input,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.inputText, { color: colors.text }]}>
        {value || <Text style={{ color: colors.textSecondary }}>{placeholder}</Text>}
      </Text>
    </View>
  );
}

// Badge
export function Badge({
  label,
  variant = 'primary',
}: {
  label: string | number;
  variant?: 'primary' | 'error' | 'success';
}) {
  const { colors } = useDarkMode();

  const bgColor = {
    primary: colors.primary,
    error: colors.error,
    success: '#10b981',
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  offlineIndicator: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
