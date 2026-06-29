# 🛡️ Guía de Resiliencia para Servidor Libra

Esta guía documenta los patrones de resiliencia implementados para mejorar la robustez del consumo de servicios en la arquitectura del servidor Libra.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Patrones Implementados](#patrones-implementados)
- [Configuración](#configuración)
- [Uso Práctico](#uso-práctico)
- [Monitoring y Métricas](#monitoring-y-métricas)
- [Fallback Strategies](#fallback-strategies)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

## 🎯 Visión General

La arquitectura de resiliencia de Libra Server implementa múltiples patrones para garantizar la disponibilidad y fiabilidad del consumo de servicios externos:

```typescript
// Arquitectura de resiliencia
Request → Retry → Circuit Breaker → Rate Limiter → Queue → Fallback → Response
```

### Beneficios Clave

- **🔄 Auto-recuperación**: Reintentos automáticos con backoff exponencial
- **⚡ Aislamiento de fallos**: Circuit breaker previene cascadas de errores
- **📊 Control de carga**: Rate limiting y colas para alta concurrencia
- **🗄️ Datos alternativos**: Fallback strategies con cache y datos mock
- **📈 Visibilidad completa**: Monitoring en tiempo real y alertas

## 🏗️ Patrones Implementados

### 1. Retry Logic con Backoff Exponencial

```typescript
import { withRetry, defaultRetryConfig } from './resilience';

const result = await withRetry(
  () => apiCall(),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  }
);
```

**Características:**
- Reintentos automáticos para errores recuperables
- Backoff exponencial para evitar sobrecarga
- Configuración por tipo de error y código HTTP

### 2. Circuit Breaker Pattern

```typescript
import { CircuitBreaker } from './resilience';

const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
  monitoringPeriod: 10000,
  expectedRecoveryTime: 30000,
}, 'user-service');

const result = await circuitBreaker.execute(() => apiCall());
```

**Estados:**
- **CLOSED**: Funcionamiento normal
- **OPEN**: Rechaza todas las peticiones
- **HALF_OPEN**: Permite peticiones limitadas para probar recuperación

### 3. Rate Limiting

```typescript
import { RateLimiter } from './resilience';

const rateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 100,
});

const result = await rateLimiter.withRateLimit(() => apiCall(), 'user-123');
```

**Características:**
- Límite de peticiones por ventana de tiempo
- Claves personalizadas por usuario/IP/servicio
- Rechazo automático cuando se excede el límite

### 4. Request Queue

```typescript
import { RequestQueue } from './resilience';

const queue = new RequestQueue({
  maxSize: 1000,
  concurrency: 10,
  timeout: 30000,
});

const result = await queue.enqueue(() => apiCall());
```

**Características:**
- Cola para manejar alta concurrencia
- Control de concurrencia simultánea
- Timeout por petición en cola

### 5. Health Checks

```typescript
import { HealthChecker } from './resilience';

const healthChecker = new HealthChecker({
  interval: 30000,
  timeout: 5000,
  unhealthyThreshold: 3,
  healthyThreshold: 2,
});

const status = await healthChecker.checkHealth('user-service', async () => {
  return await pingService();
});
```

**Características:**
- Verificación periódica de salud del servicio
- Umbral de fallos/éxitos consecutivos
- Estado global de salud del sistema

## ⚙️ Configuración

### Configuración Global

```typescript
// server/lib/resilience-config.ts
export const resilienceConfig = {
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 10000,
  },
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100,
  },
  queue: {
    maxSize: 1000,
    concurrency: 10,
    timeout: 30000,
  },
  healthCheck: {
    interval: 30000,
    timeout: 5000,
    unhealthyThreshold: 3,
  },
};
```

### Configuración por Servicio

```typescript
// Configuración específica para servicios críticos
const criticalServiceConfig = {
  retry: { maxRetries: 5, baseDelay: 500 },
  circuitBreaker: { failureThreshold: 3, resetTimeout: 30000 },
  rateLimit: { windowMs: 30000, maxRequests: 50 },
};
```

## 🚀 Uso Práctico

### Integración con Server Fetch

```typescript
import { serverFetch } from './server-fetch';

// Uso con resiliencia habilitada (por defecto)
const result = await serverFetch.get('/api/users', {
  resilience: {
    serviceName: 'user-service',
    retry: true,
    circuitBreaker: true,
    rateLimit: false,
    queue: false,
    healthCheck: 'user-service',
  },
});

// Uso sin resiliencia
const result = await serverFetch.get('/api/users', {
  resilience: {
    retry: false,
    circuitBreaker: false,
  },
});
```

### Uso en Repositories

```typescript
// server/domains/access-control/repository.ts
export const usersRepository = {
  async list(params?: ListParams) {
    return serverFetch.get<IPaginatedResponse<IUser>>('/api/users', {
      params,
      resilience: {
        serviceName: 'users',
        retry: true,
        circuitBreaker: true,
        rateLimit: true,
      },
    });
  },
  
  async create(payload: ICreateUser) {
    return serverFetch.post<IUser>('/api/users', payload, {
      resilience: {
        serviceName: 'users',
        retry: false, // No reintentar mutaciones
        circuitBreaker: true,
        queue: true, // Cola para escrituras
      },
    });
  },
};
```

### Uso en Server Actions

```typescript
// server/domains/access-control/actions.ts
export const createUserAction = async (payload: ICreateUserPermission) => {
  try {
    const result = await usersRepository.create(payload);
    
    if (result.success) {
      // Cache invalidación y logging
      await revalidateCacheTag(accessControlTags.users());
      return { success: true, data: result.data };
    }
    
    return result;
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }
    
    throw error;
  }
};
```

## 📊 Monitoring y Métricas

### Métricas Disponibles

```typescript
import { resilienceMonitor } from './resilience-monitoring';

// Obtener métricas de un servicio
const metrics = resilienceMonitor.getMetrics('user-service');

// Salud general del sistema
const systemHealth = resilienceMonitor.getSystemHealth();

// Alertas activas
const alerts = resilienceMonitor.getAlerts(undefined, false);

// Dashboard data
const dashboard = resilienceMonitor.getDashboardData();
```

### Tipos de Métricas

#### Request Metrics
- Total de peticiones
- Tasa de éxito/fracaso
- Peticiones reintentadas
- Circuit breaker trips
- Rate limiting hits
- Peticiones en cola

#### Performance Metrics
- Tiempo de respuesta promedio
- Percentiles (P95, P99)
- Respuesta más lenta/rápida

#### Health Metrics
- Estado del circuit breaker
- Fallos/éxitos consecutivos
- Últimos tiempos de fallo/éxito

### Dashboard Example

```typescript
// Componente de dashboard para Next.js
export default async function ResilienceDashboard() {
  const dashboard = resilienceMonitor.getDashboardData();
  
  return (
    <div>
      <h1>System Health: {dashboard.health.overall}</h1>
      
      <section>
        <h2>Active Alerts</h2>
        {dashboard.alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </section>
      
      <section>
        <h2>Top Services</h2>
        {dashboard.topServices.map(service => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </section>
      
      <section>
        <h2>Global Metrics</h2>
        <MetricsCard metrics={dashboard.health.globalMetrics} />
      </section>
    </div>
  );
}
```

## 🔄 Fallback Strategies

### Estrategias Predefinidas

#### Cache Fallback
```typescript
// Usa datos cacheados cuando el servicio falla
const cacheStrategy = {
  name: 'cache',
  priority: 1,
  condition: (error) => error.status >= 500,
  execute: async () => cacheFallback.get('users:list'),
  cacheFallback: true,
  cacheTTL: 600000,
};
```

#### Mock Data Fallback
```typescript
// Retorna datos mock cuando no hay cache
const mockStrategy = {
  name: 'mock-data',
  priority: 2,
  condition: (error) => error instanceof ServerApiError,
  execute: async () => ({
    content: [{ id: 1, name: 'Fallback User' }],
    total_elements: 1,
  }),
};
```

### Uso de Fallbacks

```typescript
import { fallbackManager } from './resilience-fallback';

const result = await fallbackManager.executeWithFallback(
  'users',
  () => serverFetch.get('/api/users'),
  {
    enabled: true,
    maxFallbackAttempts: 2,
    fallbackTimeout: 5000,
  }
);

if (result.source === 'fallback') {
  console.log(`Used fallback strategy: ${result.strategy}`);
}
```

### Fallbacks Personalizados

```typescript
// Registrar estrategia personalizada
fallbackManager.registerFallback('custom-service', [
  {
    name: 'alternative-api',
    priority: 1,
    condition: (error) => error.status === 503,
    execute: async () => {
      return fetch('https://backup-api.example.com/data');
    },
  },
]);
```

## 🎯 Mejores Prácticas

### 1. Configuración Gradual

```typescript
// Comenzar con retry y circuit breaker
const basicConfig = {
  retry: true,
  circuitBreaker: true,
};

// Añadir rate limiting para servicios de alto tráfico
const highTrafficConfig = {
  ...basicConfig,
  rateLimit: true,
};

// Añadir queue para servicios de escritura
const writeServiceConfig = {
  ...basicConfig,
  queue: true,
};
```

### 2. Estrategias de Retry

```typescript
// Para operaciones idempotentes (GET, PUT, DELETE)
const idempotentRetry = {
  maxRetries: 3,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Para operaciones no idempotentes (POST, PATCH)
const nonIdempotentRetry = {
  maxRetries: 1,
  retryableStatuses: [408, 429],
};
```

### 3. Circuit Breaker Tuning

```typescript
// Servicios críticos: más sensibles a fallos
const criticalService = {
  failureThreshold: 3,
  resetTimeout: 30000,
};

// Servicios no críticos: más tolerantes
const nonCriticalService = {
  failureThreshold: 10,
  resetTimeout: 120000,
};
```

### 4. Monitoring Proactivo

```typescript
// Configurar alertas automáticas
const alertThresholds = {
  errorRate: 0.05, // 5%
  responseTimeP95: 2000, // 2s
  circuitBreakerTrips: 2,
};

// Revisar métricas regularmente
setInterval(() => {
  const health = resilienceMonitor.getSystemHealth();
  if (health.overall === 'unhealthy') {
    // Enviar notificación
    notifyAdmins(health);
  }
}, 60000); // Cada minuto
```

### 5. Testing de Resiliencia

```typescript
// Tests para circuit breaker
describe('Circuit Breaker', () => {
  it('should open after failure threshold', async () => {
    const circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
    }, 'test-service');
    
    // Simular fallos
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(() => Promise.reject(new Error('Service error')));
      } catch (error) {
        // Expected
      }
    }
    
    // Circuit breaker debería estar abierto
    expect(circuitBreaker.getState()).toBe('OPEN');
    
    // Siguientes peticiones deberían ser rechazadas
    await expect(
      circuitBreaker.execute(() => Promise.resolve('success'))
    ).rejects.toThrow('Circuit test-service is OPEN');
  });
});
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Circuit Breaker Siempre Abierto
**Síntomas:** Todas las peticiones son rechazadas
**Causas:** Umbral de fallos muy bajo, servicios inestables
**Solución:**
```typescript
// Aumentar umbral de fallos
const config = {
  failureThreshold: 10, // Aumentar de 5 a 10
  resetTimeout: 120000, // Aumentar tiempo de recuperación
};
```

#### 2. Alto Número de Retries
**Síntomas:** Muchas peticiones tardan demasiado
**Causas:** Configuración de retry muy agresiva
**Solución:**
```typescript
// Reducir retries o aumentar delays
const config = {
  maxRetries: 2, // Reducir de 3 a 2
  baseDelay: 2000, // Aumentar delay base
};
```

#### 3. Rate Limiting Excesivo
**Síntomas:** Muchas peticiones rechazadas por rate limit
**Causas:** Límite muy bajo para el tráfico real
**Solución:**
```typescript
// Aumentar límite o ventana de tiempo
const config = {
  maxRequests: 200, // Aumentar de 100 a 200
  windowMs: 120000, // Aumentar ventana a 2 minutos
};
```

#### 4. Fallbacks No Funcionan
**Síntomas:** Siempre se lanza error principal
**Causas:** Estrategias no configuradas o condiciones incorrectas
**Solución:**
```typescript
// Verificar estrategias registradas
const strategies = fallbackManager.getAvailableStrategies('service-name');
console.log('Available strategies:', strategies);

// Probar fallback manualmente
const result = await fallbackManager.executeWithFallback(
  'service-name',
  () => Promise.reject(new Error('Service down')),
  { enabled: true, maxFallbackAttempts: 3 }
);
```

### Debug Tools

```typescript
// Habilitar logging detallado
const debugConfig = {
  logLevel: 'debug',
  logRequests: true,
  logRetries: true,
  logCircuitBreaker: true,
};

// Obtener estadísticas detalladas
const stats = resilienceManager.getStats();
console.log('Resilience Stats:', JSON.stringify(stats, null, 2));

// Limpiar cache si es necesario
fallbackManager.clearCache('service-name');
```

## 📚 Referencias

- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Retry Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)
- [Rate Limiting Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/throttling)
- [Fallback Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/fallback)

---

**Nota:** Esta guía está diseñada para evolucionar con la arquitectura. Contribuciones y mejoras son bienvenidas.
