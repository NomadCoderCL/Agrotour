import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '@/contexts/SyncContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

export const SyncStatusIndicator: React.FC = () => {
  const { isConnected, isSyncing, pendingCount } = useSync();
  const { colors } = useDarkMode();

  const getStatus = (): { icon: React.ComponentProps<typeof Ionicons>['name'], color: string, text: string } => {
    if (isConnected === false) {
      return { icon: 'cloud-offline-outline', color: colors.textSecondary, text: 'Offline' };
    }
    if (isSyncing) {
      return { icon: 'cloud-upload-outline', color: colors.primary, text: 'Sincronizando' };
    }
    if (pendingCount > 0) {
      return { icon: 'cloud-done-outline', color: 'orange', text: `${pendingCount} pendiente(s)` };
    }
    return { icon: 'cloud-done-outline', color: 'green', text: 'Sincronizado' };
  };

  const { icon, color, text } = getStatus();

  return (
    <View style={styles.container}>
      {isSyncing ? (
        <ActivityIndicator size="small" color={color} style={styles.icon} />
      ) : (
        <Ionicons name={icon} size={24} color={color} style={styles.icon} />
      )}
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
