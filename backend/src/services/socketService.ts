import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends any {
  userId?: string;
  userEmail?: string;
}

export class SocketService {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
  }

  public initialize(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        
        logger.info(`Socket authenticated for user: ${socket.userEmail}`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId;
    const userEmail = socket.userEmail;

    if (!userId) {
      socket.disconnect();
      return;
    }

    // Track user connections
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    logger.info(`User connected: ${userEmail} (${socket.id})`);

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Legacy support for existing authentication event
    socket.on('authenticate', (data) => {
      const { userId: authUserId } = data;
      socket.join(`user_${authUserId}`);
      logger.info(`User ${authUserId} authenticated and joined room`);
    });

      // Handle workflow updates subscription
      socket.on('subscribe-workflow-updates', (workflowId) => {
        socket.join(`workflow_${workflowId}`);
        logger.info(`Client ${socket.id} subscribed to workflow ${workflowId} updates`);
      });

      // Enhanced workflow subscription
      socket.on('workflow:subscribe', (workflowId: string) => {
        socket.join(`workflow_${workflowId}`);
        logger.info(`User ${userEmail} subscribed to workflow ${workflowId}`);
      });

      socket.on('workflow:unsubscribe', (workflowId: string) => {
        socket.leave(`workflow_${workflowId}`);
        logger.info(`User ${userEmail} unsubscribed from workflow ${workflowId}`);
      });

      // Handle analytics updates subscription
      socket.on('subscribe-analytics', (userId) => {
        socket.join(`analytics_${userId}`);
        logger.info(`Client ${socket.id} subscribed to analytics for user ${userId}`);
      });

      // Enhanced analytics subscription
      socket.on('analytics:subscribe', () => {
        socket.join(`analytics_${userId}`);
        logger.info(`User ${userEmail} subscribed to analytics updates`);
      });

      socket.on('analytics:unsubscribe', () => {
        socket.leave(`analytics_${userId}`);
        logger.info(`User ${userEmail} unsubscribed from analytics updates`);
      });

      // Handle integration status updates
      socket.on('integrations:subscribe', () => {
        socket.join(`integrations_${userId}`);
        logger.info(`User ${userEmail} subscribed to integration updates`);
      });

      socket.on('integrations:unsubscribe', () => {
        socket.leave(`integrations_${userId}`);
        logger.info(`User ${userEmail} unsubscribed from integration updates`);
      });

      // Handle real-time workflow testing
      socket.on('workflow:test', (data) => {
        logger.info(`User ${userEmail} initiated workflow test`);
        // Emit test results in real-time
        socket.emit('workflow:test:progress', { step: 'validation', status: 'running' });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      // Error handling
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${userEmail}:`, error);
      });
    });
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    const userEmail = socket.userEmail!;

    // Remove socket from user tracking
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socket.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    logger.info(`User disconnected: ${userEmail} (${socket.id})`);
  }
  }

  // Enhanced workflow execution methods
  public emitWorkflowExecutionStarted(workflowId: string, executionData: any): void {
    this.io.to(`workflow_${workflowId}`).emit('workflow-execution-started', {
      workflowId,
      execution: executionData,
      timestamp: new Date().toISOString(),
    });
    
    // Also emit to new event format
    this.io.to(`workflow_${workflowId}`).emit('workflow:update', {
      workflowId,
      status: 'running',
      execution: executionData,
      timestamp: new Date().toISOString(),
    });
  }

  public emitWorkflowExecutionCompleted(workflowId: string, executionData: any): void {
    this.io.to(`workflow_${workflowId}`).emit('workflow-execution-completed', {
      workflowId,
      execution: executionData,
      timestamp: new Date().toISOString(),
    });
    
    // Also emit to new event format
    this.io.to(`workflow_${workflowId}`).emit('workflow:update', {
      workflowId,
      status: 'completed',
      execution: executionData,
      timestamp: new Date().toISOString(),
    });
  }

  public emitWorkflowExecutionFailed(workflowId: string, executionData: any): void {
    this.io.to(`workflow_${workflowId}`).emit('workflow-execution-failed', {
      workflowId,
      execution: executionData,
      timestamp: new Date().toISOString(),
    });
    
    // Also emit to new event format
    this.io.to(`workflow_${workflowId}`).emit('workflow:update', {
      workflowId,
      status: 'failed',
      execution: executionData,
      timestamp: new Date().toISOString(),
    });
  }

  // Send message to specific user
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
    logger.debug(`Sent event '${event}' to user ${userId}`);
  }

  // Enhanced analytics update
  public emitAnalyticsUpdate(userId: string, analyticsData: any): void {
    this.io.to(`analytics_${userId}`).emit('analytics-updated', {
      analytics: analyticsData,
      timestamp: new Date().toISOString(),
    });
    
    // Also emit to new event format
    this.io.to(`analytics_${userId}`).emit('analytics:update', {
      ...analyticsData,
      timestamp: new Date().toISOString(),
    });
  }

  // Send integration status updates
  public emitIntegrationUpdate(userId: string, data: any): void {
    this.io.to(`integrations_${userId}`).emit('integrations:update', {
      ...data,
      timestamp: new Date().toISOString(),
    });
    logger.debug(`Sent integration update to user ${userId}`);
  }

  // Emit new business insight
  public emitNewBusinessInsight(userId: string, insight: any): void {
    this.io.to(`user_${userId}`).emit('new-insight', {
      insight,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit workflow status change
  public emitWorkflowStatusChange(workflowId: string, status: string, userId: string): void {
    this.io.to(`workflow_${workflowId}`).emit('workflow-status-changed', {
      workflowId,
      status,
      timestamp: new Date().toISOString(),
    });

    this.io.to(`user_${userId}`).emit('workflow-status-changed', {
      workflowId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // Enhanced system notification
  public emitSystemNotification(userId: string, notification: any): void {
    this.io.to(`user_${userId}`).emit('system-notification', {
      notification,
      timestamp: new Date().toISOString(),
    });
    
    // Also emit to new event format
    this.io.to(`user_${userId}`).emit('notification', {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to all connected users (admin functionality)
  public broadcast(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    logger.debug(`Broadcast event '${event}' to all users`);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is connected
  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get Socket.IO server instance
  public getIO(): Server {
    return this.io;
  }

  // Send real-time workflow test progress
  public emitWorkflowTestProgress(userId: string, workflowId: string, progress: any): void {
    this.io.to(`user_${userId}`).emit('workflow:test:progress', {
      workflowId,
      ...progress,
      timestamp: new Date().toISOString(),
    });
  }

  // Send real-time error notifications with auto-fix suggestions
  public emitErrorWithAutoFix(userId: string, error: any, autoFixSuggestions: any[]): void {
    this.io.to(`user_${userId}`).emit('error:auto-fix', {
      error,
      suggestions: autoFixSuggestions,
      timestamp: new Date().toISOString(),
    });
  }
}