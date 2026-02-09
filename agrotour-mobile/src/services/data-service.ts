import { apiClient } from '../shared/api';
import { localDb } from './local-db';
import { Producto, Venta, EntityType } from '../shared/types';

/**
 * Servicio de datos que maneja la lógica de "Local First" con fallback a red.
 */
export const dataService = {
    /**
     * Obtiene productos intentando primero local y luego red.
     */
    getProductos: async (forceRefresh = false): Promise<Producto[]> => {
        if (!forceRefresh) {
            const cached = await localDb.getData<Producto[]>('productos');
            if (cached && cached.length > 0) return cached;
        }

        try {
            const data = await apiClient.get<Producto[]>('/api/catalogo/?mobile=true');
            await localDb.saveData('productos', data);
            return data;
        } catch (error) {
            console.warn('Error fetching products, falling back to local:', error);
            return (await localDb.getData<Producto[]>('productos')) || [];
        }
    },

    /**
     * Registra una venta localmente y genera una operación de sincronización.
     */
    crearVenta: async (ventaData: Partial<Venta>): Promise<void> => {
        // 1. Guardar localmente (optimista)
        const pendingVentas = (await localDb.getData<any[]>('ventas_pendientes')) || [];
        const tempId = `temp_${Date.now()}`;
        const newVenta = { ...ventaData, id: tempId, status: 'pending' };

        await localDb.saveData('ventas_pendientes', [...pendingVentas, newVenta]);

        // 2. Encolar operación de sync
        // Nota: Esto asume que el syncClient se encargará de procesarlo luego
    },

    /**
     * Obtiene el perfil del usuario.
     */
    getUserProfile: async () => {
        const cached = await localDb.getData('user_profile');
        if (cached) return cached;

        try {
            const response = await apiClient.get('/auth/userinfo/');
            await localDb.saveData('user_profile', response.data);
            return response.data;
        } catch (error) {
            return null;
        }
    }
};
