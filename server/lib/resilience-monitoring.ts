/**
 * Monitoring and metrics for resilience patterns
 * Provides real-time insights into system health and performance
 */

import { resilienceManager } from './resilience';

// ─── Metrics Collection ───────────────────────────────────────────────────────

export interface ResilienceMetrics {
  timestamp: number;
  serviceName: string;
  requests: {
    total: number;
    successful: number;
    failed: number;
    retried: number;
    circuitBreakerTrips: number;
    rateLimited: number;
    queued: number;
    timedOut: number;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowestResponse: number;
    fastestResponse: number;
  };
  health: {
    circuitBreakerState: string;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastFailureTime: number;
    lastSuccessTime: number;
  };
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    lastCheck: number;
    issues: string[];
  }>;
  globalMetrics: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    activeCircuits: number;
  };
}

class ResilienceMonitor {
  private metrics = new Map<string, ResilienceMetrics[]>();
  private responseTimes = new Map<string, number[]>();
  private alerts: Array<{
    id: string;
    type: 'error_rate' | 'response_time' | 'circuit_breaker' | 'rate_limit';
    serviceName: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    resolved: boolean;
  }> = [];
  
  private readonly METRICS_WINDOW = 300000; // 5 minutes
  private readonly RESPONSE_TIME_WINDOW = 60000; // 1 minute
  private readonly ALERT_THRESHOLDS = {
    errorRate: 0.1, // 10%
    responseTimeP95: 5000, // 5 seconds
    circuitBreakerTrips: 3,
    rateLimitHits: 10,
  };

  recordRequest(serviceName: string, success: boolean, responseTime: number, metadata?: {
    retried?: boolean;
    circuitBreakerTripped?: boolean;
    rateLimited?: boolean;
    queued?: boolean;
    timedOut?: boolean;
  }): void {
    const now = Date.now();
    const timestamp = now;
    
    // Initialize service metrics if needed
    if (!this.metrics.has(serviceName)) {
      this.metrics.set(serviceName, []);
      this.responseTimes.set(serviceName, []);
    }
    
    const serviceMetrics = this.metrics.get(serviceName)!;
    const serviceResponseTimes = this.responseTimes.get(serviceName)!;
    
    // Clean old metrics
    this.cleanOldMetrics(serviceName);
    
    // Record response time
    serviceResponseTimes.push(responseTime);
    
    // Get current metrics or create new
    let currentMetrics = serviceMetrics[serviceMetrics.length - 1];
    if (!currentMetrics || now - currentMetrics.timestamp > 60000) { // New minute
      currentMetrics = {
        timestamp,
        serviceName,
        requests: { total: 0, successful: 0, failed: 0, retried: 0, circuitBreakerTrips: 0, rateLimited: 0, queued: 0, timedOut: 0 },
        performance: { averageResponseTime: 0, p95ResponseTime: 0, p99ResponseTime: 0, slowestResponse: 0, fastestResponse: Infinity },
        health: { circuitBreakerState: 'CLOSED', consecutiveFailures: 0, consecutiveSuccesses: 0, lastFailureTime: 0, lastSuccessTime: 0 }
      };
      serviceMetrics.push(currentMetrics);
    }
    
    // Update request counts
    currentMetrics.requests.total++;
    if (success) {
      currentMetrics.requests.successful++;
    } else {
      currentMetrics.requests.failed++;
    }
    
    if (metadata?.retried) currentMetrics.requests.retried++;
    if (metadata?.circuitBreakerTripped) currentMetrics.requests.circuitBreakerTrips++;
    if (metadata?.rateLimited) currentMetrics.requests.rateLimited++;
    if (metadata?.queued) currentMetrics.requests.queued++;
    if (metadata?.timedOut) currentMetrics.requests.timedOut++;
    
    // Update performance metrics
    this.updatePerformanceMetrics(serviceName);
    
    // Check for alerts
    this.checkAlerts(serviceName, currentMetrics);
  }

  private cleanOldMetrics(serviceName: string): void {
    const cutoff = Date.now() - this.METRICS_WINDOW;
    const serviceMetrics = this.metrics.get(serviceName)!;
    const serviceResponseTimes = this.responseTimes.get(serviceName)!;
    
    // Clean old metrics
    const validMetrics = serviceMetrics.filter(m => m.timestamp > cutoff);
    this.metrics.set(serviceName, validMetrics);
    
    // Clean old response times
    const validResponseTimes = serviceResponseTimes.filter((_, index) => {
      const estimatedTime = Date.now() - (serviceResponseTimes.length - index) * 1000;
      return estimatedTime < this.RESPONSE_TIME_WINDOW;
    });
    this.responseTimes.set(serviceName, validResponseTimes);
  }

  private updatePerformanceMetrics(serviceName: string): void {
    const serviceMetrics = this.metrics.get(serviceName)!;
    const serviceResponseTimes = this.responseTimes.get(serviceName)!;
    const currentMetrics = serviceMetrics[serviceMetrics.length - 1];
    
    if (serviceResponseTimes.length === 0) return;
    
    const sorted = [...serviceResponseTimes].sort((a, b) => a - b);
    const sum = serviceResponseTimes.reduce((acc, time) => acc + time, 0);
    
    currentMetrics.performance = {
      averageResponseTime: sum / serviceResponseTimes.length,
      p95ResponseTime: sorted[Math.floor(sorted.length * 0.95)] || 0,
      p99ResponseTime: sorted[Math.floor(sorted.length * 0.99)] || 0,
      slowestResponse: Math.max(...serviceResponseTimes),
      fastestResponse: Math.min(...serviceResponseTimes),
    };
    
    // Update health info from resilience manager
    const stats = resilienceManager.getStats();
    const circuitBreaker = stats.circuitBreakers.find(cb => cb.name === serviceName);
    if (circuitBreaker) {
      currentMetrics.health = {
        circuitBreakerState: circuitBreaker.state,
        consecutiveFailures: circuitBreaker.failures,
        consecutiveSuccesses: 0, // Would need to track this separately
        lastFailureTime: circuitBreaker.lastFailureTime,
        lastSuccessTime: Date.now(), // Would need to track this separately
      };
    }
  }

  private checkAlerts(serviceName: string, metrics: ResilienceMetrics): void {
    const errorRate = metrics.requests.failed / metrics.requests.total;
    const alerts: string[] = [];
    
    // Error rate alert
    if (errorRate > this.ALERT_THRESHOLDS.errorRate) {
      alerts.push(`Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold`);
    }
    
    // Response time alert
    if (metrics.performance.p95ResponseTime > this.ALERT_THRESHOLDS.responseTimeP95) {
      alerts.push(`P95 response time ${metrics.performance.p95ResponseTime}ms exceeds threshold`);
    }
    
    // Circuit breaker alert
    if (metrics.requests.circuitBreakerTrips >= this.ALERT_THRESHOLDS.circuitBreakerTrips) {
      alerts.push(`Circuit breaker tripped ${metrics.requests.circuitBreakerTrips} times`);
    }
    
    // Rate limiting alert
    if (metrics.requests.rateLimited >= this.ALERT_THRESHOLDS.rateLimitHits) {
      alerts.push(`Rate limited ${metrics.requests.rateLimited} times`);
    }
    
    // Create alerts for issues
    alerts.forEach(message => {
      const existingAlert = this.alerts.find(a => 
        a.serviceName === serviceName && 
        a.message === message && 
        !a.resolved
      );
      
      if (!existingAlert) {
        this.alerts.push({
          id: `${serviceName}-${Date.now()}-${Math.random()}`,
          type: 'error_rate',
          serviceName,
          message,
          severity: this.determineSeverity(message),
          timestamp: Date.now(),
          resolved: false,
        });
      }
    });
  }

  private determineSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
    if (message.includes('critical') || message.includes('circuit')) return 'critical';
    if (message.includes('high') || message.includes('Error rate')) return 'high';
    if (message.includes('medium')) return 'medium';
    return 'low';
  }

  getMetrics(serviceName?: string): Record<string, ResilienceMetrics[]> {
    if (serviceName) {
      return { [serviceName]: this.metrics.get(serviceName) || [] };
    }
    return Object.fromEntries(this.metrics);
  }

  getSystemHealth(): SystemHealth {
    const services: Record<string, any> = {};
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalResponseTime = 0;
    let activeCircuits = 0;
    
    for (const [serviceName, metrics] of this.metrics) {
      const latestMetrics = metrics[metrics.length - 1];
      if (!latestMetrics) continue;
      
      const errorRate = latestMetrics.requests.failed / latestMetrics.requests.total;
      const avgResponseTime = latestMetrics.performance.averageResponseTime;
      const isHealthy = errorRate < 0.05 && avgResponseTime < 2000; // Simple health criteria
      const isDegraded = errorRate < 0.1 && avgResponseTime < 5000;
      
      services[serviceName] = {
        status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
        uptime: 0.95, // Would need to calculate actual uptime
        lastCheck: latestMetrics.timestamp,
        issues: this.getServiceIssues(serviceName, latestMetrics),
      };
      
      totalRequests += latestMetrics.requests.total;
      totalSuccessful += latestMetrics.requests.successful;
      totalResponseTime += avgResponseTime * latestMetrics.requests.total;
      
      if (latestMetrics.health.circuitBreakerState === 'OPEN') {
        activeCircuits++;
      }
    }
    
    const overallHealth = this.calculateOverallHealth(services);
    
    return {
      overall: overallHealth,
      services,
      globalMetrics: {
        totalRequests,
        successRate: totalRequests > 0 ? totalSuccessful / totalRequests : 0,
        averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
        activeCircuits,
      },
    };
  }

  private getServiceIssues(serviceName: string, metrics: ResilienceMetrics): string[] {
    const issues: string[] = [];
    const errorRate = metrics.requests.failed / metrics.requests.total;
    
    if (errorRate > 0.1) issues.push('High error rate');
    if (metrics.performance.p95ResponseTime > 5000) issues.push('Slow response times');
    if (metrics.health.circuitBreakerState === 'OPEN') issues.push('Circuit breaker open');
    if (metrics.requests.rateLimited > 5) issues.push('Frequent rate limiting');
    
    return issues;
  }

  private calculateOverallHealth(services: Record<string, any>): 'healthy' | 'degraded' | 'unhealthy' {
    const serviceCount = Object.keys(services).length;
    if (serviceCount === 0) return 'healthy';
    
    const healthyCount = Object.values(services).filter(s => s.status === 'healthy').length;
    const degradedCount = Object.values(services).filter(s => s.status === 'degraded').length;
    const unhealthyCount = Object.values(services).filter(s => s.status === 'unhealthy').length;
    
    const healthyRatio = healthyCount / serviceCount;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0 || healthyRatio < 0.9) return 'degraded';
    return 'healthy';
  }

  getAlerts(serviceName?: string, resolved?: boolean) {
    return this.alerts.filter(alert => {
      if (serviceName && alert.serviceName !== serviceName) return false;
      if (resolved !== undefined && alert.resolved !== resolved) return false;
      return true;
    });
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  getDashboardData() {
    return {
      health: this.getSystemHealth(),
      alerts: this.getAlerts(undefined, false).slice(0, 10), // Last 10 unresolved alerts
      topServices: this.getTopServices(),
      recentMetrics: this.getRecentMetrics(),
    };
  }

  private getTopServices() {
    const serviceStats = Array.from(this.metrics.entries()).map(([name, metrics]) => {
      const latest = metrics[metrics.length - 1];
      if (!latest) return null;
      
      return {
        name,
        requests: latest.requests.total,
        successRate: latest.requests.successful / latest.requests.total,
        avgResponseTime: latest.performance.averageResponseTime,
        status: latest.health.circuitBreakerState,
      };
    }).filter(Boolean);
    
    return serviceStats.sort((a, b) => b.requests - a.requests).slice(0, 10);
  }

  private getRecentMetrics() {
    const now = Date.now();
    const recent = Array.from(this.metrics.entries()).map(([name, metrics]) => {
      const recentMetrics = metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes
      return {
        name,
        metrics: recentMetrics.slice(-5), // Last 5 data points
      };
    });
    
    return recent;
  }
}

// Global monitor instance
export const resilienceMonitor = new ResilienceMonitor();

// ─── Integration with Resilience Manager ─────────────────────────────────────

// Wrap resilience manager to collect metrics
const originalExecute = resilienceManager.execute.bind(resilienceManager);

resilienceManager.execute = async function<T>(
  serviceName: string,
  fn: () => Promise<T>,
  options?: any
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  let metadata: any = {};
  
  try {
    const result = await originalExecute(serviceName, fn, options);
    success = true;
    return result;
  } catch (error) {
      // Extract metadata from error
      if (error instanceof Error) {
        if (error.message.includes('Circuit')) {
          metadata.circuitBreakerTripped = true;
        }
        if (error.message.includes('Rate limit')) {
          metadata.rateLimited = true;
        }
        if (error.message.includes('timed out')) {
          metadata.timedOut = true;
        }
      }
      throw error;
    } finally {
      const responseTime = Date.now() - startTime;
      resilienceMonitor.recordRequest(serviceName, success, responseTime, metadata);
    }
};
