/**
 * API Contract Validation
 * Verifies that backend API meets expected schema and endpoints
 */

import { ENDPOINTS, API_BASE_URL } from '../shared/config';
import { api } from '../shared/api';
import { getLogger } from '../shared/logger';

const logger = getLogger('APIContractValidator');

interface EndpointStatus {
  url: string;
  method: string;
  status: 'OK' | 'ERROR' | 'UNKNOWN';
  statusCode?: number;
  error?: string;
}

interface APIContractValidation {
  timestamp: string;
  baseUrl: string;
  endpoints: Record<string, EndpointStatus>;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

/**
 * Validate API contract by checking critical endpoints
 */
export async function validateAPIContract(): Promise<APIContractValidation> {
  const validation: APIContractValidation = {
    timestamp: new Date().toISOString(),
    baseUrl: API_BASE_URL,
    endpoints: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  const endpointsToTest: Array<{ name: string; method: string; url: string; requiresAuth?: boolean }> =
    [
      // Auth endpoints
      { name: 'AUTH_LOGIN', method: 'POST', url: ENDPOINTS.AUTH.LOGIN },
      { name: 'AUTH_REGISTER', method: 'POST', url: ENDPOINTS.AUTH.REGISTER },
      { name: 'AUTH_REFRESH', method: 'POST', url: ENDPOINTS.AUTH.REFRESH },

      // Products
      { name: 'PRODUCTS_LIST', method: 'GET', url: ENDPOINTS.PRODUCTS.LIST, requiresAuth: true },
      { name: 'PRODUCTS_BATCH', method: 'POST', url: ENDPOINTS.PRODUCTS.BATCH },

      // Producers
      { name: 'PRODUCERS_LIST', method: 'GET', url: ENDPOINTS.PRODUCERS.LIST },

      // Cart / Orders
      { name: 'ORDERS_CREATE', method: 'POST', url: ENDPOINTS.CART.CREATE_ORDER, requiresAuth: true },

      // Sync
      { name: 'SYNC_PUSH', method: 'POST', url: ENDPOINTS.SYNC.PUSH, requiresAuth: true },
      { name: 'SYNC_PULL', method: 'POST', url: ENDPOINTS.SYNC.PULL, requiresAuth: true },

      // FCM
      { name: 'FCM_REGISTER', method: 'POST', url: ENDPOINTS.FCM.REGISTER_TOKEN, requiresAuth: true },
    ];

  for (const endpoint of endpointsToTest) {
    validation.summary.total++;

    try {
      let statusCode: number | undefined;

      if (endpoint.method === 'GET') {
        try {
          await api.get(endpoint.url);
          statusCode = 200;
        } catch (err: any) {
          // Even if GET fails, we want to see the status code
          statusCode = err.response?.status || 500;
          if (statusCode !== 401 && statusCode !== 403) {
            throw err;
          }
        }
      } else if (endpoint.method === 'POST') {
        try {
          // POST with minimal/empty data for validation
          await api.post(endpoint.url, {});
          statusCode = 200;
        } catch (err: any) {
          // Check if it's a validation error (400) - endpoint exists but bad data
          statusCode = err.response?.status || 500;
          if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
            // These are acceptable - endpoint exists
            statusCode = 200;
          } else {
            throw err;
          }
        }
      }

      validation.endpoints[endpoint.name] = {
        url: endpoint.url,
        method: endpoint.method,
        status: 'OK',
        statusCode,
      };

      validation.summary.passed++;
      logger.info(`✓ ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      validation.endpoints[endpoint.name] = {
        url: endpoint.url,
        method: endpoint.method,
        status: 'ERROR',
        error: errorMsg,
      };

      validation.summary.failed++;
      logger.warn(`✗ ${endpoint.name} - ${errorMsg}`);
    }
  }

  logger.info(`\n📊 API Contract Validation Summary:`);
  logger.info(`   Total: ${validation.summary.total}`);
  logger.info(`   Passed: ${validation.summary.passed}`);
  logger.info(`   Failed: ${validation.summary.failed}`);

  return validation;
}

/**
 * Validate response schema agains expected structure
 */
export function validateResponseSchema(
  data: any,
  schema: Record<string, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in data)) {
      errors.push(`Missing required field: ${key}`);
    } else if (typeof data[key] !== expectedType && expectedType !== 'any') {
      errors.push(
        `Field "${key}" has type ${typeof data[key]}, expected ${expectedType}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Expected response schemas
 */
export const RESPONSE_SCHEMAS = {
  AUTH_LOGIN: {
    access: 'string',
    refresh: 'string',
    user: 'object',
  },
  PRODUCTS_LIST: {
    results: 'object',
    count: 'number',
    next: 'any',
    previous: 'any',
  },
  PRODUCT: {
    id: 'number',
    nombre: 'string',
    precio: 'number',
    productor_id: 'number',
  },
  ORDER: {
    id: 'number',
    cliente_id: 'number',
    total: 'number',
    items: 'object',
  },
  SYNC_PUSH: {
    accepted: 'object',
    rejected: 'object',
    new_lamport_ts: 'number',
  },
};
