import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/PaymentService'; // Importar el servicio

const STRINGS = {
    title: 'Finalizar Compra',
    totalToPay: 'Total a pagar: $',
    payWithCard: 'Pagar con Tarjeta',
    paymentInProgress: 'Procesando...',
    error: 'Error',
    success: 'Éxito',
    paymentError: 'No se pudo iniciar el pago',
    paymentSuccess: 'Su pago fue procesado correctamente',
    missingSaleError: 'Error: No se especificó una venta.',
    merchantName: 'Agrotour',
    defaultCustomerName: 'Cliente Agrotour',
};

export default function CheckoutScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { clearCart } = useCart();
    const { user } = useAuth();
    const params = useLocalSearchParams();

    const ventaId = params.ventaId ? Number(params.ventaId) : null;
    const monto = params.monto ? Number(params.monto) : 0;

    const initializePaymentSheet = useCallback(async () => {
        if (!ventaId) return;

        setLoading(true);
        try {
            // Usar el nuevo servicio de pagos
            const { client_secret } = await paymentService.createPaymentIntent({ venta_id: ventaId });

            const customerName = user?.first_name ? `${user.first_name} ${user.last_name}` : STRINGS.defaultCustomerName;

            const { error } = await initPaymentSheet({
                merchantDisplayName: STRINGS.merchantName,
                paymentIntentClientSecret: client_secret,
                defaultBillingDetails: {
                    name: customerName,
                },
                returnURL: 'agrotourmobile://stripe-redirect',
            });

            if (error) {
                Alert.alert(STRINGS.error, error.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert(STRINGS.error, STRINGS.paymentError);
        } finally {
            setLoading(false);
        }
    }, [ventaId, user, initPaymentSheet]);

    useEffect(() => {
        initializePaymentSheet();
    }, [initializePaymentSheet]);

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            Alert.alert(STRINGS.success, STRINGS.paymentSuccess);
            clearCart();
            router.replace('/(tabs)/orders' as any); // Navigate to Orders history
        }
    };

    if (!ventaId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{STRINGS.missingSaleError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{STRINGS.title}</Text>
            <Text style={styles.subtitle}>{STRINGS.totalToPay}{monto.toLocaleString('es-CL')}</Text>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={openPaymentSheet} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{STRINGS.payWithCard}</Text>
                )}
            </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
