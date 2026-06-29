/**
 * Fallback strategies for resilience patterns
 * Provides alternative data sources and graceful degradation
 */

import { ServerApiError } from './types';

// ─── Fallback Strategy Types ─────────────────────────────────────────────────────

export interface FallbackConfig {
  enabled: boolean;
  strategies: FallbackStrategy[];
  maxFallbackAttempts: number;
  fallbackTimeout: number; // ms
}

export interface FallbackStrategy {
  name: string;
  priority: number; // Lower = higher priority
  condition: (error: unknown) => boolean;
  execute: () => Promise<any>;
  cacheFallback?: boolean;
  cacheTTL?: number; // ms
}

export interface FallbackResult<T> {
  data: T;
  source: 'primary' | 'fallback';
  strategy?: string;
  cached: boolean;
}

// ─── Cache-based Fallback ───────────────────────────────────────────────────────

export class CacheFallback {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  constructor(private defaultTTL: number = 300000) {} // 5 minutes default
  
  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }
  
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ─── Service-specific Fallback Strategies ───────────────────────────────────────

export class ServiceFallbackStrategies {
  private cacheFallback = new CacheFallback();
  
  // User service fallbacks
  getUserStrategies(): FallbackStrategy[] {
    return [
      {
        name: 'cache',
        priority: 1,
        condition: (error) => error instanceof ServerApiError && [500, 502, 503, 504].includes(error.status),
        execute: async () => {
          const cached = await this.cacheFallback.get('users:list');
          if (!cached) throw new Error('No cached data available');
          return cached;
        },
        cacheFallback: true,
        cacheTTL: 600000, // 10 minutes
      },
      {
        name: 'mock-data',
        priority: 2,
        condition: (error) => error instanceof ServerApiError,
        execute: async () => {
          // Return mock user data
          return {
            content: [
              { id: 1, email: 'fallback@example.com', firstName: 'Fallback', lastName: 'User' },
            ],
            total_elements: 1,
            total_pages: 1,
          };
        },
      },
    ];
  }
  
  // Menu service fallbacks
  getMenuStrategies(): FallbackStrategy[] {
    return [
      {
        name: 'cache',
        priority: 1,
        condition: (error) => error instanceof ServerApiError && [500, 502, 503, 504].includes(error.status),
        execute: async () => {
          const cached = await this.cacheFallback.get('menus:list');
          if (!cached) throw new Error('No cached data available');
          return cached;
        },
        cacheFallback: true,
        cacheTTL: 900000, // 15 minutes
      },
      {
        name: 'static-menus',
        priority: 2,
        condition: (error) => error instanceof ServerApiError,
        execute: async () => {
          // Return basic static menu structure
          return {
            content: [
              { id: 1, name: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
              { id: 2, name: 'Settings', route: '/settings', icon: 'settings' },
            ],
            total_elements: 2,
            total_pages: 1,
          };
        },
      },
    ];
  }
  
  // Role service fallbacks
  getRoleStrategies(): FallbackStrategy[] {
    return [
      {
        name: 'cache',
        priority: 1,
        condition: (error) => error instanceof ServerApiError && [500, 502, 503, 504].includes(error.status),
        execute: async () => {
          const cached = await this.cacheFallback.get('roles:list');
          if (!cached) throw new Error('No cached data available');
          return cached;
        },
        cacheFallback: true,
        cacheTTL: 1200000, // 20 minutes
      },
      {
        name: 'default-roles',
        priority: 2,
        condition: (error) => error instanceof ServerApiError,
        execute: async () => {
          return {
            content: [
              { id: 1, name: 'User', description: 'Basic user role' },
              { id: 2, name: 'Admin', description: 'Administrator role' },
            ],
            total_elements: 2,
            total_pages: 1,
          };
        },
      },
    ];
  }
  
  // Permission service fallbacks
  getPermissionStrategies(): FallbackStrategy[] {
    return [
      {
        name: 'cache',
        priority: 1,
        condition: (error) => error instanceof ServerApiError && [500, 502, 503, 504].includes(error.status),
        execute: async () => {
          const cached = await this.cacheFallback.get('permissions:list');
          if (!cached) throw new Error('No cached data available');
          return cached;
        },
        cacheFallback: true,
        cacheTTL: 1800000, // 30 minutes
      },
      {
        name: 'basic-permissions',
        priority: 2,
        condition: (error) => error instanceof ServerApiError,
        execute: async () => {
          return {
            content: [
              { id: 1, name: 'read', description: 'Read access' },
              { id: 2, name: 'write', description: 'Write access' },
            ],
            total_elements: 2,
            total_pages: 1,
          };
        },
      },
    ];
  }
}

// ─── Fallback Manager ───────────────────────────────────────────────────────────

export class FallbackManager {
  private strategies = new Map<string, FallbackStrategy[]>();
  private serviceStrategies = new ServiceFallbackStrategies();
  
  constructor() {
    this.initializeDefaultStrategies();
  }
  
  private initializeDefaultStrategies(): void {
    this.strategies.set('users', this.serviceStrategies.getUserStrategies());
    this.strategies.set('menus', this.serviceStrategies.getMenuStrategies());
    this.strategies.set('roles', this.serviceStrategies.getRoleStrategies());
    this.strategies.set('permissions', this.serviceStrategies.getPermissionStrategies());
  }
  
  registerFallback(serviceName: string, strategies: FallbackStrategy[]): void {
    this.strategies.set(serviceName, strategies);
  }
  
  async executeWithFallback<T>(
    serviceName: string,
    primaryFn: () => Promise<T>,
    config: Partial<FallbackConfig> = {}
  ): Promise<FallbackResult<T>> {
    const finalConfig: FallbackConfig = {
      enabled: true,
      strategies: [],
      maxFallbackAttempts: 3,
      fallbackTimeout: 5000,
      ...config,
    };
    
    if (!finalConfig.enabled) {
      const data = await primaryFn();
      return { data, source: 'primary', cached: false };
    }
    
    // Try primary function first
    try {
      const data = await Promise.race([
        primaryFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Primary request timeout')), finalConfig.fallbackTimeout)
        )
      ]);
      
      // Cache successful result for future fallbacks
      await this.cacheResult(serviceName, data);
      
      return { data, source: 'primary', cached: false };
    } catch (primaryError) {
      console.warn(`[fallback] Primary request failed for ${serviceName}:`, primaryError);
      
      // Get fallback strategies for this service
      const strategies = finalConfig.strategies.length > 0 
        ? finalConfig.strategies 
        : this.strategies.get(serviceName) || [];
      
      // Sort by priority
      const sortedStrategies = strategies.sort((a, b) => a.priority - b.priority);
      
      // Try fallback strategies
      for (const strategy of sortedStrategies.slice(0, finalConfig.maxFallbackAttempts)) {
        if (!strategy.condition(primaryError)) {
          continue;
        }
        
        try {
          console.log(`[fallback] Trying strategy: ${strategy.name} for ${serviceName}`);
          
          const result = await Promise.race([
            strategy.execute(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Fallback timeout')), finalConfig.fallbackTimeout)
            )
          ]);
          
          // Cache fallback result if configured
          if (strategy.cacheFallback) {
            await this.cacheResult(serviceName, result, strategy.cacheTTL);
          }
          
          return { 
            data: result, 
            source: 'fallback', 
            strategy: strategy.name,
            cached: false 
          };
        } catch (fallbackError) {
          console.warn(`[fallback] Strategy ${strategy.name} failed:`, fallbackError);
          continue;
        }
      }
      
      // All fallbacks failed, try cached data as last resort
      const cached = await this.getCachedResult<T>(serviceName);
      if (cached) {
        return { data: cached, source: 'fallback', strategy: 'cache', cached: true };
      }
      
      // No fallbacks available, re-throw original error
      throw primaryError;
    }
  }
  
  private async cacheResult(serviceName: string, data: any, ttl?: number): Promise<void> {
    const cacheFallback = new CacheFallback();
    const key = `${serviceName}:fallback`;
    cacheFallback.set(key, data, ttl);
  }
  
  private async getCachedResult<T>(serviceName: string): Promise<T | null> {
    const cacheFallback = new CacheFallback();
    const key = `${serviceName}:fallback`;
    return cacheFallback.get<T>(key);
  }
  
  getAvailableStrategies(serviceName: string): FallbackStrategy[] {
    return this.strategies.get(serviceName) || [];
  }
  
  clearCache(serviceName?: string): void {
    const cacheFallback = new CacheFallback();
    if (serviceName) {
      cacheFallback.clear(`${serviceName}:.*`);
    } else {
      cacheFallback.clear();
    }
  }
  
  getStats() {
    const cacheFallback = new CacheFallback();
    return {
      registeredServices: Array.from(this.strategies.keys()),
      cacheStats: cacheFallback.getStats(),
    };
  }
}

// ─── Enhanced Server Fetch with Fallback Integration ───────────────────────────

export function createResilientFetch(serviceName: string) {
  const fallbackManager = new FallbackManager();
  
  return {
    async get<T>(path: string, options?: any): Promise<FallbackResult<T>> {
      const primaryFn = async () => {
        // Import dynamically to avoid circular dependencies
        const { serverFetch } = await import('./server-fetch');
        return serverFetch.get<T>(path, options);
      };
      
      return fallbackManager.executeWithFallback(serviceName, primaryFn, {
        enabled: options?.fallback?.enabled !== false,
      });
    },
    
    async post<T>(path: string, body?: any, options?: any): Promise<FallbackResult<T>> {
      const primaryFn = async () => {
        const { serverFetch } = await import('./server-fetch');
        return serverFetch.post<T>(path, body, options);
      };
      
      return fallbackManager.executeWithFallback(serviceName, primaryFn, {
        enabled: options?.fallback?.enabled !== false,
      });
    },
    
    async put<T>(path: string, body?: any, options?: any): Promise<FallbackResult<T>> {
      const primaryFn = async () => {
        const { serverFetch } = await import('./server-fetch');
        return serverFetch.put<T>(path, body, options);
      };
      
      return fallbackManager.executeWithFallback(serviceName, primaryFn, {
        enabled: options?.fallback?.enabled !== false,
      });
    },
    
    async delete<T>(path: string, options?: any): Promise<FallbackResult<T>> {
      const primaryFn = async () => {
        const { serverFetch } = await import('./server-fetch');
        return serverFetch.delete<T>(path, options);
      };
      
      return fallbackManager.executeWithFallback(serviceName, primaryFn, {
        enabled: options?.fallback?.enabled !== false,
      });
    },
  };
}

// Global fallback manager instance
export const fallbackManager = new FallbackManager();

// Pre-configured resilient fetch instances
export const resilientFetch = {
  users: createResilientFetch('users'),
  menus: createResilientFetch('menus'),
  roles: createResilientFetch('roles'),
  permissions: createResilientFetch('permissions'),
};
