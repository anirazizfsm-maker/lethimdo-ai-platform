import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface SocketNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  timestamp: string;
}

export interface WorkflowUpdate {
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  execution?: any;
  timestamp: string;
}

export interface AnalyticsUpdate {
  totalTimeSaved?: number;
  totalCostSaved?: number;
  workflowsExecuted?: number;
  successRate?: number;
  timestamp: string;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if no user/token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      toast.success('Real-time connection established');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected us, reconnect manually
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      toast.error('Failed to establish real-time connection');
    });

    // Handle real-time notifications
    socket.on('notification', (notification: SocketNotification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      
      // Show toast notification
      switch (notification.type) {
        case 'success':
          toast.success(notification.message);
          break;
        case 'error':
          toast.error(notification.message);
          break;
        case 'warning':
          toast(notification.message, { icon: '⚠️' });
          break;
        default:
          toast(notification.message);
      }
    });

    // Handle legacy notification format
    socket.on('system-notification', ({ notification }) => {
      const formattedNotification: SocketNotification = {
        id: `legacy_${Date.now()}`,
        type: notification.type || 'info',
        title: notification.title || 'System Notification',
        message: notification.message,
        timestamp: new Date().toISOString(),
      };
      setNotifications(prev => [formattedNotification, ...prev.slice(0, 9)]);
      toast(notification.message);
    });

    // Handle connection establishment
    socket.on('connection:established', (data) => {
      console.log('Real-time connection established:', data);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Real-time connection error');
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, token]);

  // Subscribe to workflow updates
  const subscribeToWorkflow = (workflowId: string, callback: (update: WorkflowUpdate) => void) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.emit('workflow:subscribe', workflowId);
    
    const handleUpdate = (update: WorkflowUpdate) => {
      callback(update);
    };

    socket.on('workflow:update', handleUpdate);
    socket.on('workflow-execution-started', (data) => handleUpdate({ ...data, status: 'running' }));
    socket.on('workflow-execution-completed', (data) => handleUpdate({ ...data, status: 'completed' }));
    socket.on('workflow-execution-failed', (data) => handleUpdate({ ...data, status: 'failed' }));

    // Return cleanup function
    return () => {
      socket.emit('workflow:unsubscribe', workflowId);
      socket.off('workflow:update', handleUpdate);
      socket.off('workflow-execution-started');
      socket.off('workflow-execution-completed');
      socket.off('workflow-execution-failed');
    };
  };

  // Subscribe to analytics updates
  const subscribeToAnalytics = (callback: (update: AnalyticsUpdate) => void) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.emit('analytics:subscribe');
    
    const handleUpdate = (update: AnalyticsUpdate) => {
      callback(update);
    };

    socket.on('analytics:update', handleUpdate);
    socket.on('analytics-updated', ({ analytics }) => handleUpdate(analytics));

    // Return cleanup function
    return () => {
      socket.emit('analytics:unsubscribe');
      socket.off('analytics:update', handleUpdate);
      socket.off('analytics-updated');
    };
  };

  // Subscribe to integration updates
  const subscribeToIntegrations = (callback: (update: any) => void) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.emit('integrations:subscribe');
    
    socket.on('integrations:update', callback);

    // Return cleanup function
    return () => {
      socket.emit('integrations:unsubscribe');
      socket.off('integrations:update', callback);
    };
  };

  // Subscribe to workflow test progress
  const subscribeToWorkflowTest = (callback: (progress: any) => void) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.on('workflow:test:progress', callback);

    // Return cleanup function
    return () => {
      socket.off('workflow:test:progress', callback);
    };
  };

  // Subscribe to auto-fix suggestions
  const subscribeToAutoFix = (callback: (data: { error: any; suggestions: any[] }) => void) => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.on('error:auto-fix', callback);

    // Return cleanup function
    return () => {
      socket.off('error:auto-fix', callback);
    };
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Remove specific notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    socket: socketRef.current,
    isConnected,
    notifications,
    subscribeToWorkflow,
    subscribeToAnalytics,
    subscribeToIntegrations,
    subscribeToWorkflowTest,
    subscribeToAutoFix,
    clearNotifications,
    removeNotification,
  };
};

export default useSocket;