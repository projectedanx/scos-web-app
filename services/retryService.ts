
/**
 * Sovereign Retry System
 * Handles transient failures (429, 5xx) with exponential backoff and fallback strategies.
 */

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export interface RetryOptions<T> {
  retries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  fallback?: T | (() => Promise<T>);
  operationName?: string;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS = {
  retries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  operationName: 'Operation'
};

export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions<T> = {}
): Promise<T> => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 0;
  let currentDelay = config.initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const msg = error?.message || String(error);
      
      // Default retryable conditions if no predicate provided
      const isRateLimit = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isServerErr = msg.includes('500') || msg.includes('503') || msg.includes('Overloaded');
      const isNetworkErr = msg.includes('fetch failed') || msg.includes('network');
      
      const shouldRetry = config.shouldRetry ? config.shouldRetry(error) : (isRateLimit || isServerErr || isNetworkErr);

      if (!shouldRetry || attempt > config.retries) {
        if (config.fallback !== undefined) {
          console.warn(`[${config.operationName}] Failed after ${attempt} attempts. Using fallback.`);
          return typeof config.fallback === 'function' 
            ? (config.fallback as () => Promise<T>)() 
            : config.fallback;
        }
        if (isRateLimit) {
            throw new RateLimitError(`[${config.operationName}] Rate limit exceeded. System saturated.`);
        }
        throw error;
      }

      console.warn(`[${config.operationName}] Error: ${msg.substring(0, 50)}... Retrying in ${currentDelay}ms (Attempt ${attempt}/${config.retries})`);
      await new Promise(r => setTimeout(r, currentDelay));
      currentDelay *= config.backoffFactor;
    }
  }
};
