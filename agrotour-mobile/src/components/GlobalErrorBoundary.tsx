import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalErrorStore, GlobalError } from '../services/GlobalErrorStore';

interface Props {
    children: React.ReactNode;
}

interface State {
    error: GlobalError | null;
    errorCount: number;
}

/**
 * Global Error Boundary for catching and displaying API errors
 * Prevents app crashes on 400/500 errors and allows retry
 */
export class GlobalErrorBoundary extends React.Component<Props, State> {
    private unsubscribe: (() => void) | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            errorCount: 0,
        };
    }

    componentDidMount() {
        // Subscribe to global error store
        this.unsubscribe = globalErrorStore.subscribe((error) => {
            this.setState({
                error,
                errorCount: error ? this.state.errorCount + 1 : 0,
            });
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleRetry = () => {
        globalErrorStore.clearError();
        // The parent component will handle the retry logic
    };

    handleDismiss = () => {
        globalErrorStore.clearError();
    };

    render() {
        const { error } = this.state;
        const { children } = this.props;

        if (!error) {
            return children;
        }

        return (
            <View style={styles.container}>
                {/* Render children behind error overlay */}
                <View style={{ flex: 1 }}>{children}</View>

                {/* Error overlay */}
                <View style={styles.errorOverlay}>
                    <ScrollView style={styles.errorContainer} contentContainerStyle={styles.errorContent}>
                        {/* Error icon/badge */}
                        <View style={styles.errorIconContainer}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                        </View>

                        {/* Error type */}
                        <Text style={styles.errorType}>{error.type}</Text>

                        {/* Error message */}
                        <Text style={styles.errorMessage}>{error.message}</Text>

                        {/* Error details (if available) */}
                        {error.details && (
                            <View style={styles.detailsContainer}>
                                <Text style={styles.detailsLabel}>Detalles técnicos:</Text>
                                <Text style={styles.detailsText}>
                                    {JSON.stringify(error.details, null, 2)}
                                </Text>
                            </View>
                        )}

                        {/* Action buttons */}
                        <View style={styles.actionButtons}>
                            {error.retry && (
                                <TouchableOpacity
                                    style={[styles.button, styles.retryButton]}
                                    onPress={this.handleRetry}
                                >
                                    <Text style={styles.buttonText}>Reintentar</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.button, styles.dismissButton]}
                                onPress={this.handleDismiss}
                            >
                                <Text style={styles.buttonText}>Descartar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    errorContainer: {
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    errorContent: {
        padding: 20,
    },
    errorIconContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    errorIcon: {
        fontSize: 40,
    },
    errorType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#424242',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    detailsContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    detailsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    detailsText: {
        fontSize: 11,
        color: '#999',
        fontFamily: 'monospace',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    retryButton: {
        backgroundColor: '#4caf50',
    },
    dismissButton: {
        backgroundColor: '#9e9e9e',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});