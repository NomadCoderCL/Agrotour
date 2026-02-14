import { View, ScrollView, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '../../src/contexts/DarkModeContext';
import { useCart } from '../../src/contexts/CartContext';
import { useSync } from '../../src/contexts/SyncContext';
import { globalErrorStore } from '../../src/services/GlobalErrorStore';
import { CartItem } from '../../src/shared/types';
import { Button } from '../../src/components/UI';

export default function CarritoScreen() {
  const { colors } = useDarkMode();
  const { cartItems, getTotal, removeFromCart, updateQuantity, clearCart, confirmPurchase } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // useCart exposes cartItems directly
  const items = cartItems;
  const total = getTotal();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const result = await confirmPurchase();
      if (result && result.success) {
        // Offline Flow: Order Saved
        alert('Pedido guardado localmente (Modo Offline). Se sincronizará cuando haya internet.');
        // Don't navigate to Stripe checkout as we don't have a backend ID yet
        // Just refresh/stay or go to orders logic
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.cartItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.itemImage, { backgroundColor: colors.background }]}>
        <Text style={styles.itemEmoji}>🌾</Text>
      </View>

      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.name || 'Producto'}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          ${(item.price || 0).toLocaleString()}
        </Text>
      </View>

      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: colors.border }]}
          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
          activeOpacity={0.6}
        >
          <Ionicons name="remove" size={16} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.quantity, { color: colors.text }]}>
          {item.quantity}
        </Text>

        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: colors.border }]}
          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          activeOpacity={0.6}
        >
          <Ionicons name="add" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
        activeOpacity={0.6}
      >
        <Ionicons name="trash-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Tu carrito está vacío
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Agrega productos para comenzar a comprar
          </Text>
          <Button
            title="Explorar Productos"
            onPress={() => router.push('/(tabs)/productos')}
            variant="primary"
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />

          {/* Resumen */}
          <View
            style={[
              styles.summary,
              { backgroundColor: colors.surface, borderTopColor: colors.border },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Envío
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                A calcular
              </Text>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Proceder al Pago"
                onPress={handleCheckout}
                loading={isCheckingOut}
                variant="primary"
              />
              <Button
                title="Seguir Comprando"
                onPress={() => router.push('/(tabs)/productos')}
                variant="secondary"
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearCart}
                activeOpacity={0.6}
              >
                <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                  Limpiar Carrito
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 40,
  },
  itemDetails: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 12,
  },
  summary: {
    borderTopWidth: 1,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 16,
    gap: 8,
  },
  clearButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
