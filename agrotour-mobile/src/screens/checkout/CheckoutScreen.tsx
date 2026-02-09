import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiClient } from '../../shared/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function CheckoutScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { clearCart } = useCart();
    const { user } = useAuth();
    const params = useLocalSearchParams();

    const ventaId = params.ventaId ? Number(params.ventaId) : null;
    const monto = params.monto ? Number(params.monto) : 0;

    useEffect(() => {
        initializePaymentSheet();
    }, []);

    const initializePaymentSheet = async () => {
        if (!ventaId) return;

        setLoading(true);
        try {
            const { client_secret, publishable_key } = await apiClient.post<{ client_secret: string; publishable_key: string }>('/api/payments/create-intent/', { venta_id: ventaId });

            const { error } = await initPaymentSheet({
                merchantDisplayName: "Agrotour",
                paymentIntentClientSecret: client_secret,
                defaultBillingDetails: {
                    name: user?.first_name ? `${user.first_name} ${user.last_name}` : 'Cliente Agrotour',
                },
                returnURL: 'agrotourmobile://stripe-redirect',
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo iniciar el pago');
            setLoading(false);
        }
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            Alert.alert('Éxito', 'Su pago fue procesado correctamente');
            clearCart();
            router.replace('/(tabs)/orders'); // Navigate to Orders history
        }
    };

    if (!ventaId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: No se especificó una venta.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Finalizar Compra</Text>
            <Text style={styles.subtitle}>Total a pagar: ${monto.toLocaleString('es-CL')}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2A9D8F" />
            ) : (
                <TouchableOpacity style={styles.button} onPress={openPaymentSheet}>
                    <Text style={styles.buttonText}>Pagar con Tarjeta</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: '#666',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2A9D8F',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
