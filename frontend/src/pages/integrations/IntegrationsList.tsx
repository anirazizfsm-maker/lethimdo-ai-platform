import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { integrationsApi } from '../../services/api';
import {
  PuzzlePieceIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

// Mock data for available integrations
const mockAvailableIntegrations = [
  {
    id: 'gmail',
    name: 'Gmail',
    provider: 'google',
    type: 'oauth',
    capabilities: ['read_email', 'send_email', 'create_draft'],
    status: 'available',
    iconUrl: '📧',
    description: 'Connect your Gmail account to automate email workflows',
    category: 'Email',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    provider: 'google',
    type: 'oauth',
    capabilities: ['read_data', 'write_data', 'create_sheet'],
    status: 'available',
    iconUrl: '📊',
    description: 'Automate spreadsheet operations and data management',
    category: 'Productivity',
  },
  {
    id: 'slack',
    name: 'Slack',
    provider: 'slack',
    type: 'oauth',
    capabilities: ['send_message', 'create_channel', 'read_messages'],
    status: 'available',
    iconUrl: '💬',
    description: 'Send notifications and manage Slack communications',
    category: 'Communication',
  },
  {
    id: 'notion',
    name: 'Notion',
    provider: 'notion',
    type: 'oauth',
    capabilities: ['create_page', 'update_page', 'read_database'],
    status: 'available',
    iconUrl: '📝',
    description: 'Automate Notion workspace and database operations',
    category: 'Productivity',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    provider: 'airtable',
    type: 'api_key',
    capabilities: ['read_records', 'create_records', 'update_records'],
    status: 'available',
    iconUrl: '🗂️',
    description: 'Connect Airtable bases for data automation',
    category: 'Database',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    provider: 'hubspot',
    type: 'oauth',
    capabilities: ['manage_contacts', 'create_deals', 'send_emails'],
    status: 'available',
    iconUrl: '🎯',
    description: 'Automate CRM workflows and customer management',
    category: 'CRM',
  },
];

// Mock connected integrations
const mockConnectedIntegrations = [
  {
    id: 'conn_1',
    provider: 'gmail',
    name: 'Gmail',
    type: 'oauth',
    status: 'active',
    capabilities: ['read_email', 'send_email'],
    iconUrl: '📧',
    createdAt: '2024-01-01T10:00:00Z',
    lastUsed: '2024-01-07T09:30:00Z',
  },
  {
    id: 'conn_2',
    provider: 'google-sheets',
    name: 'Google Sheets',
    type: 'oauth',
    status: 'active',
    capabilities: ['read_data', 'write_data'],
    iconUrl: '📊',
    createdAt: '2024-01-02T14:30:00Z',
    lastUsed: '2024-01-07T11:15:00Z',
  },
  {
    id: 'conn_3',
    provider: 'slack',
    name: 'Slack',
    type: 'oauth',
    status: 'error',
    capabilities: ['send_message'],
    iconUrl: '💬',
    createdAt: '2024-01-03T16:45:00Z',
    lastUsed: '2024-01-06T14:20:00Z',
  },
];

export const IntegrationsList = () => {
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Using mock data for now
  const { data: availableIntegrations, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-integrations'],
    queryFn: () => Promise.resolve(mockAvailableIntegrations),
    // queryFn: () => integrationsApi.getAvailableIntegrations(),
  });

  const { data: connectedIntegrations, isLoading: loadingConnected, refetch } = useQuery({
    queryKey: ['connected-integrations'],
    queryFn: () => Promise.resolve(mockConnectedIntegrations),
    // queryFn: () => integrationsApi.getUserIntegrations(),
  });

  const connectMutation = useMutation({
    mutationFn: async (integration: any) => {
      if (integration.type === 'oauth') {
        // Use OAuth flow for OAuth integrations
        await integrationsApi.connectOAuth(integration.provider, integration.id);
        return { success: true };
      } else {
        // Use API key flow for API key integrations
        const apiKey = prompt(`Enter your ${integration.name} API key:`);
        if (!apiKey) throw new Error('API key is required');
        
        return integrationsApi.connectApiKey({
          provider: integration.id,
          name: integration.name,
          credentials: { apiKey },
        });
      }
    },
    onSuccess: () => {
      refetch();
      toast.success('Integration connected successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to connect integration');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (integrationId: string) => {
      // Mock disconnection
      return Promise.resolve({ success: true });
      // return integrationsApi.disconnectIntegration(integrationId);
    },
    onSuccess: () => {
      refetch();
      toast.success('Integration disconnected');
    },
    onError: () => {
      toast.error('Failed to disconnect integration');
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (integrationId: string) => {
      // Mock test
      return Promise.resolve({ success: true, data: { message: 'Connection successful' } });
      // return integrationsApi.testConnection(integrationId);
    },
    onSuccess: (response) => {
      toast.success(response.data.message || 'Connection test successful');
    },
    onError: () => {
      toast.error('Connection test failed');
    },
  });

  const categories = ['all', ...new Set(availableIntegrations?.map((i: any) => i.category) || [])];
  
  const filteredAvailable = availableIntegrations?.filter((integration: any) => {
    const categoryMatch = selectedCategory === 'all' || integration.category === selectedCategory;
    const notConnected = !connectedIntegrations?.some((conn: any) => conn.provider === integration.id);
    return categoryMatch && notConnected;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-100';
      case 'error':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className=\"h-4 w-4\" />;
      case 'error':
        return <ExclamationCircleIcon className=\"h-4 w-4\" />;
      default:
        return null;
    }
  };

  if (loadingAvailable || loadingConnected) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Integrations</h1>
          <p className=\"text-gray-600\">Connect your favorite apps to automate workflows</p>
        </div>
        <div className=\"flex items-center space-x-2\">
          <span className=\"text-sm text-gray-600\">
            {connectedIntegrations?.length || 0} connected
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className=\"border-b border-gray-200\">
        <nav className=\"-mb-px flex space-x-8\">
          {[{ id: 'connected', name: 'Connected' }, { id: 'available', name: 'Available' }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
              {tab.id === 'connected' && connectedIntegrations && (
                <span className=\"ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs\">
                  {connectedIntegrations.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'connected' ? (
        <div>
          {connectedIntegrations && connectedIntegrations.length > 0 ? (
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
              {connectedIntegrations.map((integration: any) => (
                <Card key={integration.id}>
                  <CardBody>
                    <div className=\"flex items-start justify-between\">
                      <div className=\"flex items-center space-x-3\">
                        <div className=\"text-2xl\">{integration.iconUrl}</div>
                        <div>
                          <h3 className=\"font-semibold text-gray-900\">{integration.name}</h3>
                          <div className=\"flex items-center space-x-2 mt-1\">
                            <span className={clsx('inline-flex items-center px-2 py-1 text-xs font-medium rounded-full', getStatusColor(integration.status))}>
                              {getStatusIcon(integration.status)}
                              <span className=\"ml-1\">{integration.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className=\"mt-4\">
                      <div className=\"text-xs text-gray-500 mb-2\">Capabilities:</div>
                      <div className=\"flex flex-wrap gap-1\">
                        {integration.capabilities.map((capability: string) => (
                          <span key={capability} className=\"px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded\">
                            {capability.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className=\"mt-4 text-xs text-gray-500\">
                      <div>Connected: {new Date(integration.createdAt).toLocaleDateString()}</div>
                      <div>Last used: {new Date(integration.lastUsed).toLocaleDateString()}</div>
                    </div>
                    
                    <div className=\"mt-4 flex items-center space-x-2\">
                      <Button
                        size=\"sm\"
                        variant=\"ghost\"
                        onClick={() => testConnectionMutation.mutate(integration.id)}
                        isLoading={testConnectionMutation.isPending}
                      >
                        Test
                      </Button>
                      <Button
                        size=\"sm\"
                        variant=\"ghost\"
                        leftIcon={<Cog6ToothIcon className=\"w-4 h-4\" />}
                      >
                        Settings
                      </Button>
                      <Button
                        size=\"sm\"
                        variant=\"ghost\"
                        onClick={() => disconnectMutation.mutate(integration.id)}
                        leftIcon={<TrashIcon className=\"w-4 h-4\" />}
                        isLoading={disconnectMutation.isPending}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody>
                <div className=\"text-center py-12\">
                  <PuzzlePieceIcon className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
                  <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No connected integrations</h3>
                  <p className=\"text-gray-600 mb-4\">
                    Connect your first integration to start automating workflows
                  </p>
                  <Button
                    onClick={() => setActiveTab('available')}
                    leftIcon={<PlusIcon className=\"w-4 h-4\" />}
                  >
                    Browse Available Integrations
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      ) : (
        <div>
          {/* Category Filter */}
          <Card>
            <CardBody>
              <div className=\"flex items-center space-x-4\">
                <span className=\"text-sm font-medium text-gray-700\">Filter by category:</span>
                <div className=\"flex flex-wrap gap-2\">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        'px-3 py-1 text-sm rounded-full transition-colors',
                        selectedCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Available Integrations */}
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
            {filteredAvailable.map((integration: any) => (
              <Card key={integration.id} hover>
                <CardBody>
                  <div className=\"flex items-start justify-between mb-4\">
                    <div className=\"flex items-center space-x-3\">
                      <div className=\"text-2xl\">{integration.iconUrl}</div>
                      <div>
                        <h3 className=\"font-semibold text-gray-900\">{integration.name}</h3>
                        <span className=\"text-xs text-gray-500\">{integration.category}</span>
                      </div>
                    </div>
                    <span className=\"px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded\">
                      {integration.type}
                    </span>
                  </div>
                  
                  <p className=\"text-sm text-gray-600 mb-4\">{integration.description}</p>
                  
                  <div className=\"mb-4\">
                    <div className=\"text-xs text-gray-500 mb-2\">Capabilities:</div>
                    <div className=\"flex flex-wrap gap-1\">
                      {integration.capabilities.slice(0, 3).map((capability: string) => (
                        <span key={capability} className=\"px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded\">
                          {capability.replace('_', ' ')}
                        </span>
                      ))}
                      {integration.capabilities.length > 3 && (
                        <span className=\"px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded\">
                          +{integration.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    className=\"w-full\"
                    onClick={() => connectMutation.mutate({
                      provider: integration.id,
                      name: integration.name,
                      type: integration.type,
                      credentials: {},
                    })}
                    leftIcon={<PlusIcon className=\"w-4 h-4\" />}
                    isLoading={connectMutation.isPending}
                  >
                    Connect
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
          
          {filteredAvailable.length === 0 && (
            <Card>
              <CardBody>
                <div className=\"text-center py-12\">
                  <PuzzlePieceIcon className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
                  <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No integrations found</h3>
                  <p className=\"text-gray-600\">
                    {selectedCategory !== 'all' 
                      ? `No integrations available in the ${selectedCategory} category.`
                      : 'All available integrations are already connected.'}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};", "original_text": "", "replace_all": false}]