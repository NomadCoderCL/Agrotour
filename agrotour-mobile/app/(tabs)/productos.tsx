import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext'; // 1. Importar el nuevo hook
import { LoadingSpinner, ErrorMessage } from '@/components/UI';
import { Product } from '@/shared/types';

// Componente principal de la pantalla de productos
function ProductosScreenContent() {
  const { colors } = useDarkMode();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // 2. Consumir el estado desde ProductContext
  const { products, isLoading, error, forceSync } = useProducts();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'disponible'>('all');

  // El filtrado ahora reacciona a los cambios en `products` del contexto
  useEffect(() => {
    let filtered = products;

    if (selectedFilter === 'disponible') {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedFilter, products]);

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addToCart(product, 1);
      // Opcional: Mostrar una confirmación al usuario
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.productImage, { backgroundColor: colors.background }]}>
        <Text style={styles.productEmoji}>🌾</Text>
      </View>
      <View style={styles.productContent}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
        {item.description && (
          <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.productFooter}>
          <View>
            <Text style={[styles.productPrice, { color: colors.primary }]}>${item.price}</Text>
            {item.stock > 0 ? (
              <Text style={[styles.stock, { color: colors.textSecondary }]}>Stock: {item.stock}</Text>
            ) : (
              <Text style={[styles.outOfStock, { color: colors.primary + '99' }]}>Agotado</Text>
            )}
          </View>
          {user?.rol === 'cliente' && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: item.stock > 0 ? colors.primary : colors.primary + '33' }]}
              onPress={() => handleAddToCart(item)}
              disabled={item.stock === 0}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar productos..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.filterContainer}>
             <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: selectedFilter === 'all' ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setSelectedFilter('all')}
             >
                <Text style={[styles.filterText, { color: selectedFilter === 'all' ? 'white' : colors.text }]}>Todos</Text>
             </TouchableOpacity>
             <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: selectedFilter === 'disponible' ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setSelectedFilter('disponible')}
             >
                <Text style={[styles.filterText, { color: selectedFilter === 'disponible' ? 'white' : colors.text }]}>Disponibles</Text>
             </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          !isLoading && (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No se encontraron productos</Text>
            </View>
          )
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={forceSync} // Pull-to-refresh
        refreshing={isLoading}
      />

      {isLoading && products.length === 0 && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={forceSync} />}
    </View>
  );
}

// 3. Envolver la pantalla con el Provider
export default function ProductosScreen() {
  return (
    // No necesitamos envolverlo aquí si ya está en un layout superior
    <ProductosScreenContent />
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  productImage: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 40,
  },
  productContent: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stock: {
    fontSize: 12,
  },
  outOfStock: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
