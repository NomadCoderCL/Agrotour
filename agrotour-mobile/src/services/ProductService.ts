import { api } from '../shared/api';
import { ENDPOINTS } from '../shared/config';
import { databaseManager } from '../database/DatabaseManager';
import { Product } from '../shared/types';

class ProductService {
  private db = databaseManager.getDatabase();

  /**
   * Obtiene los productos del backend y los sincroniza con la BD local.
   */
  async syncProducts(): Promise<void> {
    try {
      // 1. Obtener productos de la API
      const remoteProducts = await api.get<Product[]>(ENDPOINTS.PRODUCTS.LIST);

      if (!remoteProducts || remoteProducts.length === 0) {
        console.log("No products to sync from remote API.");
        return;
      }

      // 2. Sincronizar con la base de datos local en una única transacción
      await new Promise<void>((resolve, reject) => {
        this.db.transaction(tx => {
          remoteProducts.forEach(product => {
            tx.executeSql(
              `INSERT OR REPLACE INTO products (id, name, description, price, stock, productor_id, image_url)
               VALUES (?, ?, ?, ?, ?, ?, ?);`,
              [
                product.id,
                product.name,
                product.description,
                product.price,
                product.stock,
                product.productor_id,
                product.image_url,
              ],
              () => {},
              (_, error) => {
                console.error('Error during upsert of product:', product.id, error);
                // Devolvemos `false` para no detener la transacción por un solo fallo
                return false;
              }
            );
          });
        },
        (error) => {
            console.error('Transaction error during product sync:', error);
            reject(error)
        },
        () => {
            console.log(`${remoteProducts.length} products synced to local database.`);
            resolve();
        });
      });

    } catch (error) {
      console.error('Failed to sync products:', error);
      // Si la API falla, la app seguirá funcionando con los datos locales existentes.
      // El error ya es manejado por el interceptor de `apiClient`.
      throw error;
    }
  }

  /**
   * Obtiene todos los productos de la base de datos local.
   */
  async getLocalProducts(): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products ORDER BY name;',
          [],
          (_, { rows: { _array } }) => {
            resolve(_array as Product[]);
          },
          (_, error) => {
            console.error('Error fetching local products:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }
}

export const productService = new ProductService();
