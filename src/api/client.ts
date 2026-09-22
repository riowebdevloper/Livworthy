import { ApiErrorResponse } from './types';

export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public retryAfterSeconds?: number;

  constructor(message: string, statusCode: number, errorCode: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 12000, retries = 0, signal: externalSignal, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // Combine external abort signal with internal timeout signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-2xx HTTP responses
      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          errorData = await response.json();
        } catch {
          // Response body was not valid JSON
        }

        const errorCode = errorData?.error || `HTTP_${response.status}`;
        const errorMessage = errorData?.message || `API request failed with status ${response.status} (${response.statusText})`;
        const retryAfter = errorData?.retryAfterSeconds || (response.headers.get('Retry-After') ? parseInt(response.headers.get('Retry-After')!, 10) : undefined);

        throw new ApiError(errorMessage, response.status, errorCode, retryAfter);
      }

      // Parse JSON response safely
      const data: T = await response.json();
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        if (externalSignal?.aborted) {
          throw new ApiError('Request cancelled by user', 0, 'REQUEST_CANCELLED');
        }
        throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408, 'REQUEST_TIMEOUT');
      }

      if (err instanceof ApiError) {
        throw err;
      }

      // Safe retry for GET requests with network failures
      const isIdempotent = !fetchOptions.method || fetchOptions.method.toUpperCase() === 'GET';
      if (isIdempotent && attempt < retries) {
        attempt++;
        await new Promise((res) => setTimeout(res, 250 * attempt));
        continue;
      }

      throw new ApiError(
        err.message || 'Unable to communicate with LivWorthy calculation server.',
        0,
        'NETWORK_ERROR'
      );
    }
  }
}

// Authoritative typed API methods
export {
  calculateSalaryWorth,
  calculateSalaryNeeded,
  calculateSalaryAfterTax,
  calculateSalaryAfterTax as calculateAfterTax,
  calculateCostOfLiving,
  calculateCostOfLiving as calculateCOL,
  compareCities,
  compareCities as compareLocations,
  compareJobOffers,
} from './calculators';

export async function getCapabilities(options?: ApiFetchOptions): Promise<{ countries: any[] }> {
  return apiFetch<{ countries: any[] }>('/api/countries', options);
}

export async function getEvidence(sourceIds?: string[], options?: ApiFetchOptions): Promise<{ sources: any[] }> {
  return apiFetch<{ sources: any[] }>('/api/tax/inspect', options);
}
