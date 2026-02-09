import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { globalErrorStore, GlobalError } from '../services/GlobalErrorStore';

/**
 * Error Toast - Lightweight notification for API errors
 * Shows errors without blocking the UI like ErrorBoundary
 */
export function ErrorToast() {
    const [error, setError] = useState<GlobalError | null>(null);
    const [visible, setVisible] = useState(false);
    const slideAnim = new Animated.Value(-100);

    useEffect(() => {
        const unsubscribe = globalErrorStore.subscribe((err) => {
            if (err) {
                setError(err);
                setVisible(true);
                slideIn();
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    slideOut();
                }, 5000);
            } else {
                slideOut();
            }
        });

        return () => unsubscribe();
    }, []);

    const slideIn = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const slideOut = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            globalErrorStore.clearError();
        });
    };

    if (!visible || !error) return null;

    const errorColors: Record<string, { bg: string; text: string; icon: string }> = {
        CONTRACT_MISMATCH: { bg: '#ffebee', text: '#c62828', icon: '📱' },
        SERVER_ERROR: { bg: '#fff3e0', text: '#e65100', icon: '⚠️' },
        NETWORK_ERROR: { bg: '#e3f2fd', text: '#1565c0', icon: '📡' },
        TIMEOUT: { bg: '#f3e5f5', text: '#6a1b9a', icon: '⏱️' },
        NONE: { bg: '#f5f5f5', text: '#424242', icon: 'ℹ️' },
    };

    const colors = errorColors[error.type] || errorColors.NONE;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] },
                { backgroundColor: colors.bg },
            ]}
        >
            <Text style={styles.icon}>{colors.icon}</Text>
            <View style={styles.content}>
                <Text style={[styles.type, { color: colors.text }]}>{error.type}</Text>
                <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
                    {error.message}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        fontSize: 20,
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
    type: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        lineHeight: 16,
    },
});