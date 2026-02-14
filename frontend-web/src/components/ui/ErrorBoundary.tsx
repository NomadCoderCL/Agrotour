/**
 * ErrorBoundary - Componente que captura errores de React
 * Evita que toda la app se caiga por un error en un componente
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { config } from '@/config/env';
import getLogger from '@/lib/logger';

const logger = getLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary:', error);
    logger.error('Component stack:', errorInfo.componentStack);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-950">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              ⚠️ Error
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Algo salió mal. El error ha sido registrado.
            </p>
            {config.environment === 'development' && (
              <details className="text-xs text-red-600 dark:text-red-400">
                <summary>Detalles del error (Dev)</summary>
                <pre className="mt-2 overflow-auto max-h-40 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
