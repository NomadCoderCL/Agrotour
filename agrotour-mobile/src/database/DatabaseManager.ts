import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'agrotour.db';

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase;

  private constructor() {
    this.db = SQLite.openDatabase(DATABASE_NAME);
    console.log("Database opened");
    this.init();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getDatabase(): SQLite.SQLiteDatabase {
    return this.db;
  }

  private init(): void {
    this.db.transaction(tx => {
      // Tabla para el carrito de compras
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL UNIQUE,
          quantity INTEGER NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          image TEXT,
          added_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );`,
        [],
        () => console.log("Table 'cart_items' created or verified successfully"),
        (_, error) => {
          console.error("Error creating 'cart_items' table", error);
          return true; // Stop the transaction on error
        }
      );

      // En el futuro, aquí se agregarán otras tablas como 'products' y 'offline_queue'.

    });
  }
}

export const databaseManager = DatabaseManager.getInstance();
