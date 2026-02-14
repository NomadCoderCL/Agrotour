import { databaseManager } from '../database/DatabaseManager';
import { orderService, OrderPayload } from './OrderService';

const MAX_ATTEMPTS = 5;
const INITIAL_DELAY_MS = 1000;

interface OfflineOperation {
  id: number;
  type: 'CREATE_ORDER'; // Se expandirá con más tipos en el futuro
  payload: string;
  attempts: number;
}

class SyncService {
  private db = databaseManager.getDatabase();
  private isSyncing = false;

  /**
   * Procesa la cola de operaciones pendientes.
   */
  async processQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress.');
      return;
    }
    this.isSyncing = true;
    console.log('[SyncService] Starting queue processing...');

    try {
      const pendingOperations = await this.getPendingOperations();
      if (pendingOperations.length === 0) {
        console.log('[SyncService] No pending operations.');
        return;
      }

      console.log(`[SyncService] Found ${pendingOperations.length} pending operations.`);

      for (const op of pendingOperations) {
        try {
          await this.executeOperation(op);
          await this.updateOperationStatus(op.id, 'SUCCESS');
        } catch (error) {
          console.error(`[SyncService] Operation ${op.id} failed.`, error);
          if (op.attempts + 1 >= MAX_ATTEMPTS) {
            await this.updateOperationStatus(op.id, 'FAILED', op.attempts + 1);
          } else {
            await this.incrementAttempt(op.id);
          }
        }
      }
    } catch (error) {
      console.error('[SyncService] Critical error during queue processing:', error);
    } finally {
      this.isSyncing = false;
      console.log('[SyncService] Queue processing finished.');
    }
  }

  private async executeOperation(op: OfflineOperation): Promise<void> {
    // Exponential backoff
    const delay = INITIAL_DELAY_MS * Math.pow(2, op.attempts);
    if (op.attempts > 0) {
        console.log(`[SyncService] Retrying operation ${op.id} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    switch (op.type) {
      case 'CREATE_ORDER':
        const payload = JSON.parse(op.payload) as OrderPayload;
        await orderService.createOrder(payload);
        break;
      default:
        console.warn(`[SyncService] Unknown operation type: ${op.type}`);
        // Marcar como fallido para no reintentar indefinidamente
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }

  private getPendingOperations(): Promise<OfflineOperation[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM offline_queue WHERE status = 'PENDING' OR status = 'RETRY';`,
          [],
          (_, { rows: { _array } }) => resolve(_array as OfflineOperation[]),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  private updateOperationStatus(id: number, status: 'SUCCESS' | 'FAILED', attempts?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.executeSql(
        `UPDATE offline_queue SET status = ?, attempts = COALESCE(?, attempts) WHERE id = ?;`,
        [status, attempts, id],
        () => resolve(),
        (_, error) => {
            reject(error)
            return true;
        }
      );
    });
  }

    private incrementAttempt(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.executeSql(
                `UPDATE offline_queue SET attempts = attempts + 1, status = 'RETRY' WHERE id = ?;`,
                [id],
                () => resolve(),
                (_, error) => {
                    reject(error)
                    return true;
                }
            );
        });
    }
}

export const syncService = new SyncService();
