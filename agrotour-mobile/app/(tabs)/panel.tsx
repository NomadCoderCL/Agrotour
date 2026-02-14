import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Importar useRouter

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { globalErrorStore } from '@/services/GlobalErrorStore';
import { Button } from '@/components/UI';

export default function PanelScreen() {
  const { colors } = useDarkMode();
  const { user } = useAuth();
  const router = useRouter(); // 2. Obtener el router

  const isProducer = user?.rol === 'productor';
  const isAdmin = user?.rol === 'admin';

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'settings'>('overview');

  if (!isProducer && !isAdmin) {
    // ... (sin cambios)
  }

  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* 3. Añadir botón para escanear QR */}
      <View style={styles.section}>
        <Button
          title="Validar Entrega (QR)"
          variant="primary"
          onPress={() => router.push('/qr-scanner')}
          icon={<Ionicons name="qr-code" size={20} color="white" />}
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
         {/* ... (sin cambios) */}
      </View>

      {/* Recent Orders */}
       {/* ... (sin cambios) */}

      {/* Alerts */}
      {isAdmin && (
         {/* ... (sin cambios) */}
      )}
    </ScrollView>
  );

  const renderProducts = () => (
     {/* ... (sin cambios) */}
  );

  const renderOrders = () => (
     {/* ... (sin cambios) */}
  );

  const renderAnalytics = () => (
     {/* ... (sin cambios) */}
  );

  const renderSettings = () => (
     {/* ... (sin cambios) */}
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Navigation */}
       {/* ... (sin cambios) */}

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'settings' && renderSettings()}
    </View>
  );
}

const styles = StyleSheet.create({
   // ... (sin cambios)
});
