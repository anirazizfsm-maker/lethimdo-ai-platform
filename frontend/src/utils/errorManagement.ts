// Global error handling and monitoring utilities

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  component?: string;
  action?: string;
}

class ErrorManager {
  private static instance: ErrorManager;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandling();
  }

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private setupGlobalErrorHandling(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.error?.message || event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });

    // Handle promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });

    // Handle React errors (if using Error Boundary)
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.reportError({
        message: event.detail.error?.message || 'React Error',
        stack: event.detail.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId,
        component: event.detail.component,
      });
    }) as EventListener);
  }

  reportError(errorReport: Partial<ErrorReport>): void {
    const fullReport: ErrorReport = {
      message: errorReport.message || 'Unknown error',
      stack: errorReport.stack,
      url: errorReport.url || window.location.href,
      userAgent: errorReport.userAgent || navigator.userAgent,
      timestamp: errorReport.timestamp || Date.now(),
      userId: errorReport.userId || this.userId,
      sessionId: errorReport.sessionId || this.sessionId,
      component: errorReport.component,
      action: errorReport.action,
    };

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', fullReport);
    }

    // Send to backend error tracking
    this.sendErrorReport(fullReport);

    // Send to third-party services (Sentry, LogRocket, etc.)
    this.sendToThirdPartyServices(fullReport);
  }

  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    } catch (error) {
      console.error('Failed to send error report to backend:', error);
    }
  }

  private sendToThirdPartyServices(errorReport: ErrorReport): void {
    // Sentry integration
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setTag('sessionId', errorReport.sessionId);
        scope.setUser({ id: errorReport.userId });
        scope.setContext('errorReport', errorReport);
        window.Sentry.captureException(new Error(errorReport.message));
      });
    }

    // LogRocket integration
    if (typeof window !== 'undefined' && window.LogRocket) {
      window.LogRocket.captureException(new Error(errorReport.message));
    }

    // Google Analytics error tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: errorReport.message,
        fatal: false,
      });
    }
  }

  // Method for manual error reporting
  captureException(error: Error, context?: any): void {
    this.reportError({
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  // Method for capturing custom events/actions
  captureEvent(eventName: string, properties?: any): void {
    const event = {
      name: eventName,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Send to backend
    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch(console.error);
  }
}

// Performance monitoring
class PerformanceMonitor {
  static trackPageLoad(): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perf = window.performance.timing;
          const loadTime = perf.loadEventEnd - perf.navigationStart;
          
          ErrorManager.getInstance().captureEvent('page_load_time', {
            loadTime,
            url: window.location.href,
          });
        }, 0);
      });
    }
  }

  static trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
    ErrorManager.getInstance().captureEvent('api_call', {
      endpoint,
      method,
      duration,
      status,
    });
  }

  static trackUserAction(action: string, component: string, properties?: any): void {
    ErrorManager.getInstance().captureEvent('user_action', {
      action,
      component,
      ...properties,
    });
  }
}

// Automatic retry mechanism for failed API calls
class RetryManager {
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second

  static async withRetry<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          ErrorManager.getInstance().reportError({
            message: `Failed after ${this.maxRetries} attempts: ${lastError.message}`,
            stack: lastError.stack,
            action: context,
          });
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    throw lastError!;
  }
}

// Initialize error management
const errorManager = ErrorManager.getInstance();

// Initialize performance monitoring
PerformanceMonitor.trackPageLoad();

// Export for use throughout the app
export {
  ErrorManager,
  PerformanceMonitor,
  RetryManager,
  errorManager,
};

// Type declarations for third-party services
declare global {
  interface Window {
    Sentry?: any;
    LogRocket?: any;
    gtag?: (...args: any[]) => void;
  }
}