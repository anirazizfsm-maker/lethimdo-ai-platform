import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiEndpoints, checkApiConnection } from '../services/api';
// import toast from 'react-hot-toast'; // Import this in components that need it

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiEndpoints.health(),
    retry: 3,
    refetchInterval: 30000, // Check every 30 seconds
  });
};

// API connection status hook
export const useApiConnection = () => {
  return useQuery({
    queryKey: ['api-connection'],
    queryFn: checkApiConnection,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Authentication hooks
export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiEndpoints.auth.me(),
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiEndpoints.auth.login,
    onSuccess: (response) => {
      // Store token
      if (response.data.token) {
        localStorage.setItem('lethimdo_token', response.data.token);
      }
      
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // toast.success('Login successful!');
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: apiEndpoints.auth.register,
    onSuccess: () => {
      // toast.success('Registration successful! Please log in.');
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

// Integrations hooks
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiEndpoints.integrations.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConnectIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiEndpoints.integrations.connect(id),
    onSuccess: (_response, _id) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      // toast.success(`Successfully connected to ${id}!`);
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'Connection failed');
    },
  });
};

export const useDiscoverIntegration = () => {
  return useMutation({
    mutationFn: (url: string) => apiEndpoints.integrations.discover(url),
    onSuccess: () => {
      // toast.success('API discovered successfully!');
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'Discovery failed');
    },
  });
};

// Workflows hooks
export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiEndpoints.workflows.list(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiEndpoints.workflows.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      // toast.success('Workflow created successfully!');
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'Failed to create workflow');
    },
  });
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiEndpoints.workflows.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      // toast.success('Workflow executed successfully!');
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'Workflow execution failed');
    },
  });
};

// AI hooks (for future use)
export const useGenerateWorkflow = () => {
  return useMutation({
    mutationFn: ({ description, businessContext }: { 
      description: string; 
      businessContext?: string 
    }) => apiEndpoints.ai.generateWorkflow(description, businessContext),
    onSuccess: () => {
      // toast.success('AI workflow generated successfully!');
    },
    onError: (_error: any) => {
      // toast.error(error.response?.data?.message || 'AI generation failed');
    },
  });
};