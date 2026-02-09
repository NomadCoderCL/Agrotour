import { View, ScrollView, StyleSheet, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { dataService } from '@/services/DataService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { globalErrorStore } from '@/services/GlobalErrorStore';

export default function ProductosScreen() {
  const { colors } = useDarkMode();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'disponible'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedFilter, productos]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const products = await dataService.getProducts();
      setProductos(products);
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudieron cargar los productos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = productos;

    if (selectedFilter === 'disponible') {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Producto) => {
    if (product.stock > 0) {
      addItem(product, 1);
    }
  };

  const renderProductCard = ({ item }: { item: Producto }) => (
    <View
      style={[
        styles.productCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.productImage, { backgroundColor: colors.background }]}>
        <Text style={styles.productEmoji}>🌾</Text>
      </View>

      <View style={styles.productContent}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {item.nombre}
        </Text>

        {item.descripcion && (
          <Text
            style={[styles.productDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.descripcion}
          </Text>
        )}

        <View style={styles.productFooter}>
          <View>
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              ${item.precio}
            </Text>
            {item.stock > 0 && (
              <Text style={[styles.stock, { color: colors.textSecondary }]}>
                Stock: {item.stock}
              </Text>
            )}
            {item.stock === 0 && (
              <Text style={[styles.outOfStock, { color: colors.primary + '99' }]}>
                Agotado
              </Text>
            )}
          </View>

          {user?.rol === 'cliente' && (
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor:
                    item.stock > 0 ? colors.primary : colors.primary + '33',
                },
              ]}
              onPress={() => handleAddToCart(item)}
              disabled={item.stock === 0}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          )}

          {(user?.rol === 'productor' || user?.rol === 'admin') && (
            <View style={styles.producerBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search and Filter */}
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

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedFilter === 'all' ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedFilter === 'all' ? 'white' : colors.text },
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedFilter === 'disponible' ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setSelectedFilter('disponible')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  selectedFilter === 'disponible' ? 'white' : colors.text,
              },
            ]}
          >
            Disponibles
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={loadProducts} />}

      {!isLoading && !error && (
        <>
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </Text>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="leaf-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No se encontraron productos
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
            />
          )}
        </>
      )}
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  resultCount: {
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  productImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 50,
  },
  productContent: {
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
  producerBadge: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
