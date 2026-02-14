import * as SQLite from 'expo-sqlite';

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;
    private static instance: DatabaseService;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async init(): Promise<void> {
        if (this.db) return;

        this.db = await SQLite.openDatabaseAsync('agrotour.db');

        // Inicializar tablas
        await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT,
        producer_id INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Database initialized successfully');
    }

    public getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return this.db;
    }

    // --- MÉTODOS DE CAJA NEGRA (OFFLINE QUEUE) ---
    public async queueAction(action: string, data: any): Promise<void> {
        const db = this.getDatabase();
        await db.runAsync(
            'INSERT INTO offline_queue (action_type, payload) VALUES (?, ?)',
            action,
            JSON.stringify(data)
        );
        console.log(`Action queued: ${action}`);
    }

    // --- MÉTODOS CARRITO (Facade) ---
    public async addToCart(productId: number, quantity: number, userId: number | null): Promise<void> {
        const db = this.getDatabase();
        // Check if exists
        const existing = await db.getFirstAsync<{ id: number; quantity: number }>(
            'SELECT id, quantity FROM cart WHERE product_id = ?',
            productId
        );

        if (existing) {
            await db.runAsync(
                'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
                quantity,
                existing.id
            );
        } else {
            await db.runAsync(
                'INSERT INTO cart (product_id, quantity, user_id) VALUES (?, ?, ?)',
                productId,
                quantity,
                userId
            );
        }
    }

    public async getCartItems(): Promise<any[]> {
        const db = this.getDatabase();
        // En una implementación real, haríamos JOIN con products.
        // Por ahora asumimos que products también está poblada o consultamos solo IDs.
        // Para cumplir el requerimiento de "ver el producto", necesitamos datos del producto.
        // Vamos a hacer un JOIN simple.
        return await db.getAllAsync(`
      SELECT c.*, p.name, p.price, p.image_url 
      FROM cart c 
      LEFT JOIN products p ON c.product_id = p.id
    `);
    }

    public async removeFromCart(cartId: number): Promise<void> {
        const db = this.getDatabase();
        await db.runAsync('DELETE FROM cart WHERE id = ?', cartId);
    }

    public async clearCart(): Promise<void> {
        const db = this.getDatabase();
        await db.runAsync('DELETE FROM cart');
    }
}

export default DatabaseService.getInstance();
