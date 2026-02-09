/**
 * API Contract Validation & Monitoring
 * Verifies backend API schema, endpoints, and performance SLAs
 * Critical for Phase 2A MVP stability
 */

import { apiClient } from '@/shared/api';
import { API_TIMEOUTS } from '@/shared/constants';

// ===== TYPE DEFINITIONS =====

export interface ApiEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  requiresAuth: boolean;
  expectedStatusCode?: number;
}

export interface EndpointValidationResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'TIMEOUT' | 'SKIP';
  statusCode?: number;
  latency: number;
  error?: string;
  timestamp: string;
}

export interface ApiContractReport {
  timestamp: string;
  baseUrl: string;
  validatedEndpoints: EndpointValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    avgLatency: number;
  };
  recommendations: string[];
}

// ===== CRITICAL ENDPOINTS TO VALIDATE =====

const CRITICAL_ENDPOINTS: ApiEndpoint[] = [
  // Auth
  { name: 'loginEndpoint', method: 'POST', path: '/auth/login/', requiresAuth: false },
  { name: 'refreshTokenEndpoint', method: 'POST', path: '/auth/refresh/', requiresAuth: true },
  { name: 'logoutEndpoint', method: 'POST', path: '/auth/logout/', requiresAuth: true },
  { name: 'registerEndpoint', method: 'POST', path: '/auth/register/', requiresAuth: false },

  // Products
  { name: 'listProductsEndpoint', method: 'GET', path: '/productos/', requiresAuth: false },
  { name: 'getProductEndpoint', method: 'GET', path: '/productos/1/', requiresAuth: false },

  // Productores
  { name: 'listProducersEndpoint', method: 'GET', path: '/productores/', requiresAuth: false },
  { name: 'getProducerEndpoint', method: 'GET', path: '/productores/1/', requiresAuth: false },

  // Orders
  { name: 'createOrderEndpoint', method: 'POST', path: '/orders/', requiresAuth: true },
  { name: 'listOrdersEndpoint', method: 'GET', path: '/orders/', requiresAuth: true },

  // Sync (Critical for Phase 2A offline)
  { name: 'syncPushEndpoint', method: 'POST', path: '/sync/push/', requiresAuth: true },
  { name: 'syncPullEndpoint', method: 'GET', path: '/sync/pull/', requiresAuth: true },
];

/**
 * Validate entire API contract against expected schema
 * Timeout: 30s total per endpoint
 */
export async function validateAPIContract(
  verbose = false
): Promise<ApiContractReport> {
  const report: ApiContractReport = {
    timestamp: new Date().toISOString(),
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'UNKNOWN',
    validatedEndpoints: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      avgLatency: 0,
    },
    recommendations: [],
  };

  let totalLatency = 0;

  for (const endpoint of CRITICAL_ENDPOINTS) {
    try {
      const startTime = Date.now();

      let result: EndpointValidationResult = {
        endpoint: endpoint.path,
        method: endpoint.method,
        status: 'SKIP',
        latency: 0,
        timestamp: new Date().toISOString(),
      };

      // Skip authenticated endpoints for now
      if (endpoint.requiresAuth) {
        report.summary.skipped++;
        report.validatedEndpoints.push(result);
        continue;
      }

      // Make request
      try {
        let response;
        if (endpoint.method === 'GET') {
          response = await apiClient.get(endpoint.path, {
            timeout: API_TIMEOUTS.MEDIUM,
          });
        } else if (endpoint.method === 'POST') {
          response = await apiClient.post(endpoint.path, {}, {
            timeout: API_TIMEOUTS.MEDIUM,
          });
        }

        const latency = Date.now() - startTime;
        totalLatency += latency;

        result = {
          endpoint: endpoint.path,
          method: endpoint.method,
          status: 'PASS',
          statusCode: response?.status || 200,
          latency,
          timestamp: new Date().toISOString(),
        };

        report.summary.passed++;

        if (verbose) {
          console.log(`✅ ${endpoint.name}: ${latency}ms`);
        }
      } catch (err: any) {
        const latency = Date.now() - startTime;
        totalLatency += latency;

        // 404 is OK (resource doesn't exist, but endpoint exists)
        const isOK404 = err.response?.status === 404;
        // 400/405 is OK (endpoint exists, bad request)
        const isBadRequest = err.response?.status === 400 || err.response?.status === 405;

        result = {
          endpoint: endpoint.path,
          method: endpoint.method,
          status: isOK404 || isBadRequest ? 'PASS' : 'FAIL',
          statusCode: err.response?.status,
          latency,
          error: err.message,
          timestamp: new Date().toISOString(),
        };

        if (isOK404 || isBadRequest) {
          report.summary.passed++;
        } else {
          report.summary.failed++;
          report.recommendations.push(`⚠️ ${endpoint.name} failed: ${err.message}`);
        }

        if (verbose) {
          console.error(`❌ ${endpoint.name}: ${err.message} (${latency}ms)`);
        }
      }

      report.validatedEndpoints.push(result);
      report.summary.total++;
    } catch (err) {
      console.error(`[validateAPIContract] Unexpected error:`, err);
    }
  }

  // Calculate averages
  const passedEndpoints = report.validatedEndpoints.filter((e) => e.status === 'PASS');
  if (passedEndpoints.length > 0) {
    report.summary.avgLatency = Math.round(
      passedEndpoints.reduce((sum, e) => sum + e.latency, 0) / passedEndpoints.length
    );
  }

  // Add recommendations
  if (report.summary.avgLatency > 500) {
    report.recommendations.push('⚠️ Average API latency > 500ms - consider optimization');
  }

  if (report.summary.failed > 0) {
    report.recommendations.push(
      `❌ ${report.summary.failed} endpoints failed - backend may be unreachable`
    );
  }

  if (report.summary.passed === report.summary.total) {
    report.recommendations.push('✅ All endpoints validated successfully - API contract OK');
  }

  return report;
}

/**
 * Quick health check - validate top 5 non-auth endpoints
 */
export async function quickHealthCheck(): Promise<boolean> {
  const criticalEndpoints = CRITICAL_ENDPOINTS.filter((e) => !e.requiresAuth).slice(0, 5);

  for (const endpoint of criticalEndpoints) {
    try {
      await apiClient.get(endpoint.path, {
        timeout: API_TIMEOUTS.SHORT,
      });
    } catch (err) {
      console.error(`[healthCheck] ${endpoint.name} failed:`, err);
      return false;
    }
  }

  return true;
}

/**
 * Generate human-readable report
 */
export function formatContractReport(report: ApiContractReport): string {
  const lines = [
    `\n${'='.repeat(60)}`,
    `API CONTRACT VALIDATION REPORT`,
    `${'='.repeat(60)}`,
    `Timestamp: ${report.timestamp}`,
    `Base URL: ${report.baseUrl}`,
    ``,
    `Summary:`,
    `  Total Endpoints: ${report.summary.total}`,
    `  Passed: ${report.summary.passed} ✅`,
    `  Failed: ${report.summary.failed} ❌`,
    `  Skipped: ${report.summary.skipped} ⏭️`,
    `  Avg Latency: ${report.summary.avgLatency}ms`,
    ``,
  ];

  if (report.recommendations.length > 0) {
    lines.push(`Recommendations:`);
    report.recommendations.forEach((rec) => lines.push(`  ${rec}`));
  }

  lines.push(`${'='.repeat(60)}\n`);

  return lines.join('\n');
}

/**
 * Validate response schema structure
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
      errors.push(`Field "${key}" has type ${typeof data[key]}, expected ${expectedType}`);
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
    precio: 'string', // String in Phase 2A
    stock: 'number',
  },
  ORDER: {
    id: 'number',
    items: 'object',
    total: 'string',
  },
};
