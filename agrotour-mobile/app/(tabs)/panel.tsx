import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContextV2';
import { globalErrorStore } from '@/services/GlobalErrorStore';

export default function PanelScreen() {
  const { colors } = useDarkMode();
  const { user } = useAuth();

  const isProducer = user?.rol === 'productor';
  const isAdmin = user?.rol === 'admin';

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'settings'>('overview');

  if (!isProducer && !isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDenied}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.primary} />
          <Text style={[styles.accessTitle, { color: colors.text }]}>
            Acceso Denegado
          </Text>
          <Text style={[styles.accessSubtitle, { color: colors.textSecondary }]}>
            Esta sección es solo para productores y administradores
          </Text>
        </View>
      </View>
    );
  }

  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="cart" size={32} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Órdenes</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="leaf" size={32} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Productos</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="trending-up" size={32} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>$0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ventas</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="star" size={32} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>-</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Órdenes Recientes</Text>
        <View
          style={[
            styles.emptySection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            No hay órdenes recientes
          </Text>
        </View>
      </View>

      {/* Alerts */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas del Sistema</Text>
          <View
            style={[
              styles.alertCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.alertText, { color: colors.text }]}>
              Sistema funcionando correctamente
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.section}>
        <Button title="Agregar Producto" variant="primary" onPress={() => {}} />
      </View>
      <View
        style={[
          styles.emptySection,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
          No hay productos
        </Text>
      </View>
    </ScrollView>
  );

  const renderOrders = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Historiales de Órdenes</Text>
        <View
          style={[
            styles.emptySection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="box-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            No hay órdenes registradas
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Análitica</Text>
        <View
          style={[
            styles.emptySection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="bar-chart-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            Esta funcionalidad está en desarrollo
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración</Text>
        
        <View
          style={[
            styles.settingItem,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Nombre
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {user?.nombre}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        <View
          style={[
            styles.settingItem,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Email
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        {isProducer && (
          <View
            style={[
              styles.settingItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Ubicación
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                No configurada
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        scrollEnabled={true}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'overview' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="home"
            size={20}
            color={activeTab === 'overview' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'overview' ? colors.primary : colors.textSecondary },
            ]}
          >
            Resumen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'products' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons
            name="leaf"
            size={20}
            color={activeTab === 'products' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'products' ? colors.primary : colors.textSecondary },
            ]}
          >
            Productos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'orders' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="cart"
            size={20}
            color={activeTab === 'orders' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'orders' ? colors.primary : colors.textSecondary },
            ]}
          >
            Órdenes
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'analytics' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('analytics')}
          >
            <Ionicons
              name="bar-chart"
              size={20}
              color={activeTab === 'analytics' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'analytics' ? colors.primary : colors.textSecondary },
              ]}
            >
              Análitica
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'settings' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings"
            size={20}
            color={activeTab === 'settings' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'settings' ? colors.primary : colors.textSecondary },
            ]}
          >
            Config
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
  container: {
    flex: 1,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  accessSubtitle: {
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    marginTop: 12,
  },
  alertCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
  },
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 12,
  },
});
