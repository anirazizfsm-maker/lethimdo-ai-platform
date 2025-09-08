import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, User, Workflow, Analytics, BusinessInsight, Integration } from '../../../shared/types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  refreshToken: async (token: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh', { token });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Workflow API
export const workflowApi = {
  getWorkflows: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Workflow[]>> => {
    const response = await api.get('/workflows', { params });
    return response.data;
  },

  getWorkflow: async (id: string): Promise<ApiResponse<Workflow>> => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (data: { name: string; description?: string; naturalLanguageInput: string }): Promise<ApiResponse<Workflow>> => {
    const response = await api.post('/workflows/create', data);
    return response.data;
  },

  updateWorkflow: async (id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },

  executeWorkflow: async (id: string): Promise<ApiResponse<{ execution: any; workflow: Workflow }>> => {
    const response = await api.post(`/workflows/${id}/execute`);
    return response.data;
  },

  getWorkflowExecutions: async (id: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/workflows/${id}/executions`, { params });
    return response.data;
  },

  getWorkflowStatus: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/workflows/${id}/status`);
    return response.data;
  },

  testWorkflow: async (workflowData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/workflows/test', workflowData);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async (period: string): Promise<ApiResponse<Analytics>> => {
    const response = await api.get(`/analytics?period=${period}`);
    return response.data;
  },

  getTimeSavings: async (period: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/analytics/time-savings?period=${period}`);
    return response.data;
  },

  getCostSavings: async (period: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/analytics/cost-savings?period=${period}`);
    return response.data;
  },

  getWorkflowPerformance: async (workflowId?: string): Promise<ApiResponse<any>> => {
    const url = workflowId ? `/analytics/workflow-performance/${workflowId}` : '/analytics/workflow-performance';
    const response = await api.get(url);
    return response.data;
  },
};

// AI API
export const aiApi = {
  generateWorkflow: async (data: { description: string; businessContext?: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/ai/generate-workflow', data);
    return response.data;
  },

  getRecommendations: async (): Promise<ApiResponse<BusinessInsight[]>> => {
    const response = await api.get('/ai/recommendations');
    return response.data;
  },

  analyzeBusiness: async (data: any): Promise<ApiResponse<BusinessInsight[]>> => {
    const response = await api.post('/ai/analyze-business', data);
    return response.data;
  },

  suggestImprovements: async (workflowId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/ai/suggest-improvements/${workflowId}`);
    return response.data;
  },
};

// Integrations API
export const integrationsApi = {
  getAvailableIntegrations: async (): Promise<ApiResponse<Integration[]>> => {
    const response = await api.get('/integrations/available');
    return response.data;
  },

  getUserIntegrations: async (): Promise<ApiResponse<Integration[]>> => {
    const response = await api.get('/integrations');
    return response.data;
  },

  // Initialize OAuth flow
  initOAuth: async (provider: string, service?: string): Promise<ApiResponse<{ authUrl: string; state: string }>> => {
    const url = service 
      ? `/integrations/oauth/init/${provider}/${service}`
      : `/integrations/oauth/init/${provider}`;
    const response = await api.get(url);
    return response.data;
  },

  connectIntegration: async (data: { provider: string; credentials: any }): Promise<ApiResponse<Integration>> => {
    const response = await api.post('/integrations/connect', data);
    return response.data;
  },

  // Connect via OAuth (redirects to OAuth provider)
  connectOAuth: async (provider: string, service?: string): Promise<void> => {
    try {
      const response = await integrationsApi.initOAuth(provider, service);
      if (response.success && response.data) {
        // Redirect to OAuth provider
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Failed to initialize OAuth flow');
      }
    } catch (error) {
      throw error;
    }
  },

  // Connect with API key
  connectApiKey: async (data: { provider: string; name: string; credentials: { apiKey: string } }): Promise<ApiResponse<Integration>> => {
    const response = await api.post('/integrations/connect', {
      ...data,
      type: 'api_key',
    });
    return response.data;
  },

  disconnectIntegration: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/integrations/${id}/disconnect`);
    return response.data;
  },

  testConnection: async (id: string): Promise<ApiResponse<{ status: boolean }>> => {
    const response = await api.post(`/integrations/${id}/test`);
    return response.data;
  },

  getIntegrationUsage: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/integrations/${id}/usage`);
    return response.data;
  },

  updateIntegration: async (id: string, data: Partial<Integration>): Promise<ApiResponse<Integration>> => {
    const response = await api.put(`/integrations/${id}`, data);
    return response.data;
  },

  // Marketplace API
  searchMarketplace: async (params: {
    query?: string;
    category?: string;
    sortBy?: string;
    priceFilter?: string[];
    minRating?: number;
    verified?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> => {
    const response = await api.get('/integrations/marketplace/search', { params });
    return response.data.data;
  },

  installFromMarketplace: async (integrationId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/integrations/marketplace/install/${integrationId}`);
    return response.data;
  },

  getFavorites: async (): Promise<any[]> => {
    const response = await api.get('/integrations/favorites');
    return response.data.data;
  },

  addToFavorites: async (integrationId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/integrations/favorites/${integrationId}`);
    return response.data;
  },

  removeFromFavorites: async (integrationId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/integrations/favorites/${integrationId}`);
    return response.data;
  },

  discoverAPI: async (url: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/integrations/discover', { url });
    return response.data;
  },

  createCustomIntegration: async (data: {
    name: string;
    description?: string;
    baseUrl: string;
    authMethod?: string;
    endpoints?: any[];
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/integrations/custom', data);
    return response.data;
  },

  testIntegration: async (integrationId: string, credentials?: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/integrations/test/${integrationId}`, { credentials });
    return response.data;
  },

  getReviews: async (integrationId: string, params?: { limit?: number; offset?: number }): Promise<any[]> => {
    const response = await api.get(`/integrations/${integrationId}/reviews`, { params });
    return response.data.data;
  },

  submitReview: async (integrationId: string, data: { rating: number; comment?: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/integrations/${integrationId}/reviews`, data);
    return response.data;
  },
};

export default api;", "original_text": "", "replace_all": false}]