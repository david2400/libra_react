/**
 * Resilience patterns for server-side service consumption
 * Implements Retry, Circuit Breaker, Rate Limiting, and other resilience mechanisms
 */

import { ServerApiError } from './types';

// ─── Retry Logic with Exponential Backoff ─────────────────────────────────────

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  backoffFactor: number;
  retryableErrors: string[];
  retryableStatuses: number[];
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

function isRetryableError(error: unknown, config: RetryConfig): boolean {
  if (error instanceof ServerApiError) {
    return config.retryableStatuses.includes(error.status);
  }
  
  if (error instanceof Error) {
    return config.retryableErrors.some(code => 
      error.message.includes(code) || (error as any).code === code
    );
  }
  
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt or if error is not retryable
      if (attempt > finalConfig.maxRetries || !isRetryableError(error, finalConfig)) {
        throw error;
      }
      
      const delay = calculateDelay(attempt, finalConfig);
      console.warn(`[resilience] Retry attempt ${attempt}/${finalConfig.maxRetries} after ${delay}ms`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// ─── Circuit Breaker Pattern ──────────────────────────────────────────────────

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number; // ms
  monitoringPeriod: number; // ms
  expectedRecoveryTime: number; // ms
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;
  
  constructor(
    private config: CircuitBreakerConfig,
    private name: string
  ) {}
  
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }
  
  private recordSuccess(): void {
    this.successCount++;
    this.failures = 0;
    
    if (this.state === CircuitState.HALF_OPEN && this.successCount >= 3) {
      this.state = CircuitState.CLOSED;
      this.successCount = 0;
      console.log(`[resilience] Circuit ${this.name} recovered to CLOSED state`);
    }
  }
  
  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.CLOSED && this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.warn(`[resilience] Circuit ${this.name} opened due to ${this.failures} failures`);
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      console.warn(`[resilience] Circuit ${this.name} re-opened from HALF_OPEN`);
    }
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log(`[resilience] Circuit ${this.name} attempting reset (HALF_OPEN)`);
      } else {
        throw new Error(`Circuit ${this.name} is OPEN. Rejecting request.`);
      }
    }
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getStats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount,
    };
  }
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (context?: any) => string;
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(private config: RateLimitConfig) {}
  
  private cleanup(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.config.windowMs);
    
    if (validRequests.length === 0) {
      this.requests.delete(key);
    } else {
      this.requests.set(key, validRequests);
    }
  }
  
  async checkLimit(key: string = 'default'): Promise<boolean> {
    this.cleanup(key);
    
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    if (requests.length >= this.config.maxRequests) {
      return false;
    }
    
    requests.push(now);
    this.requests.set(key, requests);
    return true;
  }
  
  async withRateLimit<T>(
    fn: () => Promise<T>,
    key?: string
  ): Promise<T> {
    const limitKey = this.config.keyGenerator?.(key) || key || 'default';
    
    if (!(await this.checkLimit(limitKey))) {
      throw new Error(`Rate limit exceeded for key: ${limitKey}`);
    }
    
    return fn();
  }
}

// ─── Request Queue for High Concurrency ───────────────────────────────────────

export interface QueueConfig {
  maxSize: number;
  concurrency: number;
  timeout: number; // ms
}

export class RequestQueue {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private running = 0;
  
  constructor(private config: QueueConfig) {}
  
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.config.maxSize) {
        reject(new Error('Queue is full'));
        return;
      }
      
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }
  
  private async process(): Promise<void> {
    if (this.running >= this.config.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const job = this.queue.shift();
    
    if (!job) {
      this.running--;
      return;
    }
    
    // Set timeout
    const timeout = setTimeout(() => {
      job.reject(new Error('Request timed out in queue'));
      this.running--;
      this.process();
    }, this.config.timeout);
    
    try {
      const result = await Promise.race([
        job.fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request execution timeout')), this.config.timeout)
        )
      ]);
      
      clearTimeout(timeout);
      job.resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      job.reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
  
  getStats() {
    return {
      queueLength: this.queue.length,
      running: this.running,
      maxSize: this.config.maxSize,
      concurrency: this.config.concurrency,
    };
  }
}

// ─── Health Check Service ─────────────────────────────────────────────────────

export interface HealthCheckConfig {
  interval: number; // ms
  timeout: number; // ms
  unhealthyThreshold: number;
  healthyThreshold: number;
}

export interface HealthStatus {
  healthy: boolean;
  lastCheck: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

export class HealthChecker {
  private status = new Map<string, HealthStatus>();
  
  constructor(private config: HealthCheckConfig) {}
  
  async checkHealth(name: string, checkFn: () => Promise<boolean>): Promise<HealthStatus> {
    const current = this.status.get(name) || {
      healthy: true,
      lastCheck: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    };
    
    try {
      const isHealthy = await Promise.race([
        checkFn(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), this.config.timeout)
        )
      ]);
      
      current.healthy = isHealthy;
      current.consecutiveSuccesses++;
      current.consecutiveFailures = 0;
    } catch (error) {
      current.healthy = false;
      current.consecutiveFailures++;
      current.consecutiveSuccesses = 0;
    }
    
    current.lastCheck = Date.now();
    this.status.set(name, current);
    
    return current;
  }
  
  isHealthy(name: string): boolean {
    const status = this.status.get(name);
    if (!status) return true;
    
    return status.healthy && 
           status.consecutiveFailures < this.config.unhealthyThreshold;
  }
  
  getAllStatus() {
    return Object.fromEntries(this.status);
  }
}

// ─── Resilience Manager (Orchestrates all patterns) ─────────────────────────────

export interface ResilienceConfig {
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  rateLimit?: Partial<RateLimitConfig>;
  queue?: Partial<QueueConfig>;
  healthCheck?: Partial<HealthCheckConfig>;
}

export class ResilienceManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private rateLimiters = new Map<string, RateLimiter>();
  private queues = new Map<string, RequestQueue>();
  private healthChecker: HealthChecker;
  
  constructor(private config: ResilienceConfig = {}) {
    this.healthChecker = new HealthChecker({
      interval: 30000,
      timeout: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
      ...config.healthCheck,
    });
  }
  
  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    options: {
      retry?: boolean;
      circuitBreaker?: boolean;
      rateLimit?: boolean;
      queue?: boolean;
      healthCheck?: string;
    } = {}
  ): Promise<T> {
    let result = fn;
    
    // Wrap with retry logic
    if (options.retry !== false) {
      const retryConfig = this.config.retry || {};
      result = () => withRetry(result, retryConfig);
    }
    
    // Wrap with circuit breaker
    if (options.circuitBreaker !== false) {
      if (!this.circuitBreakers.has(name)) {
        const cbConfig = this.config.circuitBreaker || {};
        this.circuitBreakers.set(name, new CircuitBreaker({
          failureThreshold: 5,
          resetTimeout: 60000,
          monitoringPeriod: 10000,
          expectedRecoveryTime: 30000,
          ...cbConfig,
        }, name));
      }
      
      const circuitBreaker = this.circuitBreakers.get(name)!;
      result = () => circuitBreaker.execute(result);
    }
    
    // Wrap with rate limiting
    if (options.rateLimit) {
      if (!this.rateLimiters.has(name)) {
        const rlConfig = this.config.rateLimit || {};
        this.rateLimiters.set(name, new RateLimiter({
          windowMs: 60000,
          maxRequests: 100,
          ...rlConfig,
        }));
      }
      
      const rateLimiter = this.rateLimiters.get(name)!;
      result = () => rateLimiter.withRateLimit(result, name);
    }
    
    // Wrap with queue
    if (options.queue) {
      if (!this.queues.has(name)) {
        const qConfig = this.config.queue || {};
        this.queues.set(name, new RequestQueue({
          maxSize: 1000,
          concurrency: 10,
          timeout: 30000,
          ...qConfig,
        }));
      }
      
      const queue = this.queues.get(name)!;
      result = () => queue.enqueue(result);
    }
    
    // Check health before execution
    if (options.healthCheck && !this.healthChecker.isHealthy(options.healthCheck)) {
      throw new Error(`Service ${options.healthCheck} is unhealthy`);
    }
    
    return result();
  }
  
  getStats() {
    return {
      circuitBreakers: Array.from(this.circuitBreakers.values()).map(cb => cb.getStats()),
      rateLimiters: Array.from(this.rateLimiters.keys()),
      queues: Array.from(this.queues.values()).map(q => q.getStats()),
      healthChecks: this.healthChecker.getAllStatus(),
    };
  }
}

// Global resilience manager instance
export const resilienceManager = new ResilienceManager();
