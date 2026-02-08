/**
 * Global Error Store for API Contract Mismatches
 * Centralized error handling without crashing the app
 */

export type ErrorType = 'CONTRACT_MISMATCH' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'NONE';

export interface GlobalError {
    type: ErrorType;
    message: string;
    retry: boolean;
    timestamp: number;
    details?: any;
}

class GlobalErrorStore {
    private subscribers: Set<(error: GlobalError | null) => void> = new Set();
    private currentError: GlobalError | null = null;

    /**
     * Set error and notify subscribers
     */
    setError(type: ErrorType, message: string, details?: any): void {
        this.currentError = {
            type,
            message,
            retry: type === 'CONTRACT_MISMATCH' || type === 'SERVER_ERROR' || type === 'TIMEOUT',
            timestamp: Date.now(),
            details,
        };
        console.warn(`[GlobalError] ${type}: ${message}`, details);
        this.notifySubscribers();
    }

    /**
     * Clear current error
     */
    clearError(): void {
        this.currentError = null;
        this.notifySubscribers();
    }

    /**
     * Get current error
     */
    getError(): GlobalError | null {
        return this.currentError;
    }

    /**
     * Subscribe to error changes
     */
    subscribe(callback: (error: GlobalError | null) => void): () => void {
        this.subscribers.add(callback);
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notify all subscribers
     */
    private notifySubscribers(): void {
        this.subscribers.forEach((callback) => {
            callback(this.currentError);
        });
    }
}

export const globalErrorStore = new GlobalErrorStore();