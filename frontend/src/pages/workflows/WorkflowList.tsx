import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { workflowApi } from '../../services/api';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

// Mock data for demo
const mockWorkflows = [
  {
    id: '1',
    name: 'Email to Google Sheets Sync',
    description: 'Automatically sync new emails to Google Sheets daily',
    status: 'active',
    naturalLanguageInput: 'Connect my Gmail to Google Sheets and sync emails daily',
    executionCount: 24,
    successRate: 98.5,
    estimatedTimeSavings: 45,
    estimatedCostSavings: 120,
    createdAt: '2024-01-01T10:00:00Z',
    lastExecuted: '2024-01-07T09:30:00Z',
  },
  {
    id: '2',
    name: 'Slack Notification System',
    description: 'Send notifications to Slack when important events occur',
    status: 'active',
    naturalLanguageInput: 'Send me Slack notifications when customers submit support tickets',
    executionCount: 156,
    successRate: 96.2,
    estimatedTimeSavings: 20,
    estimatedCostSavings: 80,
    createdAt: '2024-01-02T14:30:00Z',
    lastExecuted: '2024-01-07T11:15:00Z',
  },
  {
    id: '3',
    name: 'Invoice Processing Pipeline',
    description: 'Process and categorize incoming invoices automatically',
    status: 'paused',
    naturalLanguageInput: 'Process invoices from email attachments and categorize them by vendor',
    executionCount: 8,
    successRate: 92.0,
    estimatedTimeSavings: 60,
    estimatedCostSavings: 200,
    createdAt: '2024-01-03T16:45:00Z',
    lastExecuted: '2024-01-06T14:20:00Z',
  },
  {
    id: '4',
    name: 'Customer Onboarding Automation',
    description: 'Automate the customer onboarding process with welcome emails and setup',
    status: 'active',
    naturalLanguageInput: 'When new customers sign up, send welcome email and create their account setup',
    executionCount: 12,
    successRate: 100,
    estimatedTimeSavings: 30,
    estimatedCostSavings: 150,
    createdAt: '2024-01-04T09:15:00Z',
    lastExecuted: '2024-01-07T10:45:00Z',
  },
];

export const WorkflowList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Using mock data for now - replace with real API calls when backend is ready
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows', statusFilter],
    queryFn: () => Promise.resolve(mockWorkflows),
    // queryFn: () => workflowApi.getWorkflows({ status: statusFilter !== 'all' ? statusFilter : undefined }),
  });

  const filteredWorkflows = workflows?.filter((workflow: any) =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"text-center py-12\">
        <p className=\"text-error-600\">Failed to load workflows. Please try again.</p>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Workflows</h1>
          <p className=\"text-gray-600\">Manage and monitor your automation workflows</p>
        </div>
        <Link to=\"/dashboard/workflows/new\">
          <Button leftIcon={<PlusIcon className=\"w-4 h-4\" />}>
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className=\"flex flex-col sm:flex-row gap-4\">
            {/* Search */}
            <div className=\"flex-1\">
              <div className=\"relative\">
                <MagnifyingGlassIcon className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400\" />
                <input
                  type=\"text\"
                  placeholder=\"Search workflows...\"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=\"pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className=\"flex items-center space-x-2\">
              <FunnelIcon className=\"h-4 w-4 text-gray-400\" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className=\"border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500\"
              >
                <option value=\"all\">All Status</option>
                <option value=\"active\">Active</option>
                <option value=\"paused\">Paused</option>
                <option value=\"draft\">Draft</option>
                <option value=\"failed\">Failed</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardBody>
            <div className=\"text-center py-12\">
              <div className=\"mx-auto h-12 w-12 text-gray-400 mb-4\">
                <svg fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={1} d=\"M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2\" />
                </svg>
              </div>
              <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No workflows found</h3>
              <p className=\"text-gray-600 mb-4\">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first workflow.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link to=\"/dashboard/workflows/new\">
                  <Button leftIcon={<PlusIcon className=\"w-4 h-4\" />}>
                    Create Your First Workflow
                  </Button>
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
          {filteredWorkflows.map((workflow: any) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
};

interface WorkflowCardProps {
  workflow: any;
}

const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'paused':
        return 'status-paused';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-draft';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayIcon className=\"h-4 w-4\" />;
      case 'paused':
        return <PauseIcon className=\"h-4 w-4\" />;
      default:
        return null;
    }
  };

  return (
    <Card hover>
      <CardBody>
        <div className=\"space-y-4\">
          {/* Header */}
          <div className=\"flex items-start justify-between\">
            <div className=\"flex-1\">
              <h3 className=\"text-lg font-semibold text-gray-900 mb-1\">{workflow.name}</h3>
              <p className=\"text-sm text-gray-600\">{workflow.description}</p>
            </div>
            <div className=\"flex items-center space-x-1\">
              <span className={clsx('inline-flex items-center px-2 py-1 text-xs font-medium rounded-full', getStatusColor(workflow.status))}>
                {getStatusIcon(workflow.status)}
                <span className=\"ml-1\">{workflow.status}</span>
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className=\"grid grid-cols-2 gap-4\">
            <div>
              <p className=\"text-sm text-gray-500\">Executions</p>
              <p className=\"text-lg font-semibold text-gray-900\">{workflow.executionCount}</p>
            </div>
            <div>
              <p className=\"text-sm text-gray-500\">Success Rate</p>
              <p className=\"text-lg font-semibold text-gray-900\">{workflow.successRate}%</p>
            </div>
            <div>
              <p className=\"text-sm text-gray-500\">Time Saved</p>
              <p className=\"text-lg font-semibold text-gray-900\">{workflow.estimatedTimeSavings}h</p>
            </div>
            <div>
              <p className=\"text-sm text-gray-500\">Cost Saved</p>
              <p className=\"text-lg font-semibold text-gray-900\">${workflow.estimatedCostSavings}</p>
            </div>
          </div>

          {/* Actions */}
          <div className=\"flex items-center justify-between pt-4 border-t border-gray-200\">
            <div className=\"text-xs text-gray-500\">
              Last run: {new Date(workflow.lastExecuted).toLocaleString()}
            </div>
            <div className=\"flex items-center space-x-2\">
              <Link to={`/dashboard/workflows/${workflow.id}`}>
                <Button variant=\"ghost\" size=\"sm\" leftIcon={<EyeIcon className=\"w-4 h-4\" />}>
                  View
                </Button>
              </Link>
              <Button variant=\"ghost\" size=\"sm\" leftIcon={<PencilIcon className=\"w-4 h-4\" />}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};", "original_text": "", "replace_all": false}]