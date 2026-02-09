import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { dataService } from '@/services/DataService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { globalErrorStore } from '@/services/GlobalErrorStore';

export default function HomeScreen() {
  const { colors } = useDarkMode();
  const { user, isLoading: authLoading } = useAuth();
  const { items: cartItems } = useCart();
  const router = useRouter();

  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const products = await dataService.getProducts();
      setFeaturedProducts(products.slice(0, 6));
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudieron cargar los productos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const cartCount = cartItems.length;
  const isProducer = user?.rol === 'productor';
  const isAdmin = user?.rol === 'admin';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              ¡Bienvenido!
            </Text>
            <Text style={[styles.userName, { color: colors.textSecondary }]}>
              {user?.nombre || 'Usuario'}
            </Text>
          </View>
          {!isProducer && !isAdmin && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartCount}>{cartCount}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceso Rápido</Text>

          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/productos')}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="leaf" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Productos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/mapa')}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="map" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Mapa</Text>
            </TouchableOpacity>

            {!isProducer && !isAdmin && (
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(tabs)/carrito')}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="cart" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Mi Carrito</Text>
              </TouchableOpacity>
            )}

            {(isProducer || isAdmin) && (
              <TouchableOpacity
                style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(tabs)/panel')}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="settings" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Panel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Productos Destacados</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/productos')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} onRetry={loadFeaturedProducts} />}

          {!isLoading && !error && featuredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay productos disponibles
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tu Perfil</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nombre:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Rol:</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {user?.rol === 'cliente' ? 'Cliente' : user?.rol === 'productor' ? 'Productor' : 'Administrador'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
  },
  cartBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  quickAccessSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  infoSection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
