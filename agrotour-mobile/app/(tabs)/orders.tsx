import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useDarkMode } from '../../src/contexts/DarkModeContext';
import DatabaseService from '../../src/services/DatabaseService';

export default function OrdersScreen() {
    const { colors } = useDarkMode();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            // En una app real, esto leería de una tabla 'orders' sincronizada.
            // Por ahora, leemos de offline_queue para mostrar intentos.
            const db = DatabaseService.getDatabase();
            const queued = await db.getAllAsync('SELECT * FROM offline_queue WHERE action_type = ? ORDER BY timestamp DESC', 'CREATE_ORDER');
            setOrders(queued);
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Mis Pedidos</Text>
            {orders.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes pedidos recientes.</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.orderId, { color: colors.text }]}>Pedido #{item.id} (Queue)</Text>
                            <Text style={[styles.orderStatus, { color: colors.primary }]}>{item.status}</Text>
                            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
    },
    orderCard: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderStatus: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    orderDate: {
        fontSize: 12,
        marginTop: 4,
    },
});
