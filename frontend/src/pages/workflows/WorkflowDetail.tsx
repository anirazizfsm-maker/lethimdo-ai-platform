import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { workflowApi } from '../../services/api';
import {
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

// Mock workflow data
const mockWorkflow = {
  id: '1',
  name: 'Email to Google Sheets Sync',
  description: 'Automatically sync new emails to Google Sheets daily',
  status: 'active',
  naturalLanguageInput: 'Connect my Gmail to Google Sheets and sync emails daily at 9 AM',
  executionCount: 24,
  successRate: 98.5,
  estimatedTimeSavings: 45,
  estimatedCostSavings: 120,
  createdAt: '2024-01-01T10:00:00Z',
  lastExecuted: '2024-01-07T09:30:00Z',
  config: {
    schedule: '0 9 * * *',
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 5000,
    },
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: ['email', 'slack'],
    },
  },
};

const mockExecutions = [
  {
    id: '1',
    status: 'success',
    startTime: '2024-01-07T09:30:00Z',
    endTime: '2024-01-07T09:32:15Z',
    duration: 135,
    timeSaved: 45,
    costSaved: 12,
    triggeredBy: 'schedule',
  },
  {
    id: '2',
    status: 'success',
    startTime: '2024-01-06T09:30:00Z',
    endTime: '2024-01-06T09:31:48Z',
    duration: 108,
    timeSaved: 45,
    costSaved: 12,
    triggeredBy: 'schedule',
  },
  {
    id: '3',
    status: 'failed',
    startTime: '2024-01-05T09:30:00Z',
    endTime: '2024-01-05T09:30:45Z',
    duration: 45,
    timeSaved: 0,
    costSaved: 0,
    triggeredBy: 'schedule',
    errorMessage: 'Gmail API rate limit exceeded',
  },
  {
    id: '4',
    status: 'success',
    startTime: '2024-01-04T09:30:00Z',
    endTime: '2024-01-04T09:31:22Z',
    duration: 82,
    timeSaved: 45,
    costSaved: 12,
    triggeredBy: 'manual',
  },
];

export const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'settings'>('overview');

  // Using mock data for now
  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => Promise.resolve(mockWorkflow),
    // queryFn: () => workflowApi.getWorkflow(id!),
  });

  const { data: executions } = useQuery({
    queryKey: ['workflow-executions', id],
    queryFn: () => Promise.resolve(mockExecutions),
    // queryFn: () => workflowApi.getWorkflowExecutions(id!),
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: () => {
      // Mock execution
      return Promise.resolve({ success: true, data: { executionId: 'new-exec' } });
      // return workflowApi.executeWorkflow(id!);
    },
    onSuccess: () => {
      toast.success('Workflow executed successfully!');
    },
    onError: () => {
      toast.error('Failed to execute workflow');
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: (updates: { status: string }) => {
      // Mock update
      return Promise.resolve({ success: true });
      // return workflowApi.updateWorkflow(id!, updates);
    },
    onSuccess: () => {
      toast.success('Workflow updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update workflow');
    },
  });

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className=\"text-center py-12\">
        <p className=\"text-error-600\">Workflow not found</p>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    updateWorkflowMutation.mutate({ status: newStatus });
  };

  const handleExecute = () => {
    executeWorkflowMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'paused': return 'status-paused';
      case 'failed': return 'status-failed';
      default: return 'status-draft';
    }
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className=\"h-5 w-5 text-success-500\" />;
      case 'failed':
        return <XCircleIcon className=\"h-5 w-5 text-error-500\" />;
      case 'running':
        return <ClockIcon className=\"h-5 w-5 text-warning-500\" />;
      default:
        return <ExclamationTriangleIcon className=\"h-5 w-5 text-gray-500\" />;
    }
  };

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center space-x-4\">
          <Button 
            variant=\"ghost\" 
            onClick={() => navigate('/dashboard/workflows')}
            leftIcon={<ArrowLeftIcon className=\"w-4 h-4\" />}
          >
            Back
          </Button>
          <div>
            <h1 className=\"text-2xl font-bold text-gray-900\">{workflow.name}</h1>
            <p className=\"text-gray-600\">{workflow.description}</p>
          </div>
        </div>
        <div className=\"flex items-center space-x-3\">
          <span className={clsx('inline-flex items-center px-3 py-1 text-sm font-medium rounded-full', getStatusColor(workflow.status))}>
            {workflow.status}
          </span>
          <Button
            variant={workflow.status === 'active' ? 'warning' : 'success'}
            onClick={handleToggleStatus}
            leftIcon={workflow.status === 'active' ? <PauseIcon className=\"w-4 h-4\" /> : <PlayIcon className=\"w-4 h-4\" />}
            isLoading={updateWorkflowMutation.isPending}
          >
            {workflow.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button
            onClick={handleExecute}
            leftIcon={<PlayIcon className=\"w-4 h-4\" />}
            isLoading={executeWorkflowMutation.isPending}
          >
            Run Now
          </Button>
          <Button variant=\"ghost\" leftIcon={<PencilIcon className=\"w-4 h-4\" />}>
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className=\"border-b border-gray-200\">
        <nav className=\"-mb-px flex space-x-8\">
          {[{ id: 'overview', name: 'Overview' }, { id: 'executions', name: 'Executions' }, { id: 'settings', name: 'Settings' }].map((tab) => (
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
          {/* Metrics */}
          <div className=\"lg:col-span-2 space-y-6\">
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
              <Card>
                <CardBody className=\"text-center\">
                  <div className=\"text-2xl font-bold text-gray-900\">{workflow.executionCount}</div>
                  <div className=\"text-sm text-gray-600\">Total Executions</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className=\"text-center\">
                  <div className=\"text-2xl font-bold text-success-600\">{workflow.successRate}%</div>
                  <div className=\"text-sm text-gray-600\">Success Rate</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className=\"text-center\">
                  <div className=\"text-2xl font-bold text-primary-600\">{workflow.estimatedTimeSavings}h</div>
                  <div className=\"text-sm text-gray-600\">Time Saved</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className=\"text-center\">
                  <div className=\"text-2xl font-bold text-success-600\">${workflow.estimatedCostSavings}</div>
                  <div className=\"text-sm text-gray-600\">Cost Saved</div>
                </CardBody>
              </Card>
            </div>

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <h3 className=\"text-lg font-semibold text-gray-900\">Recent Executions</h3>
              </CardHeader>
              <CardBody>
                <div className=\"space-y-3\">
                  {executions?.slice(0, 5).map((execution: any) => (
                    <div key={execution.id} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
                      <div className=\"flex items-center space-x-3\">
                        {getExecutionStatusIcon(execution.status)}
                        <div>
                          <div className=\"text-sm font-medium text-gray-900\">
                            {new Date(execution.startTime).toLocaleString()}
                          </div>
                          <div className=\"text-xs text-gray-500\">
                            Duration: {execution.duration}s • Triggered by: {execution.triggeredBy}
                          </div>
                          {execution.errorMessage && (
                            <div className=\"text-xs text-error-600\">{execution.errorMessage}</div>
                          )}
                        </div>
                      </div>
                      <div className=\"text-sm text-gray-500\">
                        {execution.status === 'success' && (
                          <span className=\"text-success-600\">+{execution.timeSaved}min saved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Workflow Details */}
          <div className=\"space-y-6\">
            <Card>
              <CardHeader>
                <h3 className=\"text-lg font-semibold text-gray-900\">Workflow Details</h3>
              </CardHeader>
              <CardBody>
                <div className=\"space-y-4\">
                  <div>
                    <dt className=\"text-sm font-medium text-gray-500\">Created</dt>
                    <dd className=\"text-sm text-gray-900\">{new Date(workflow.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className=\"text-sm font-medium text-gray-500\">Last Executed</dt>
                    <dd className=\"text-sm text-gray-900\">{new Date(workflow.lastExecuted).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className=\"text-sm font-medium text-gray-500\">Schedule</dt>
                    <dd className=\"text-sm text-gray-900\">{workflow.config.schedule || 'Manual only'}</dd>
                  </div>
                  <div>
                    <dt className=\"text-sm font-medium text-gray-500\">Original Request</dt>
                    <dd className=\"text-sm text-gray-900 bg-gray-50 p-2 rounded\">
                      \"{workflow.naturalLanguageInput}\"
                    </dd>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'executions' && (
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Execution History</h3>
          </CardHeader>
          <CardBody>
            <div className=\"overflow-x-auto\">
              <table className=\"min-w-full divide-y divide-gray-200\">
                <thead className=\"bg-gray-50\">
                  <tr>
                    <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Status</th>
                    <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Start Time</th>
                    <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Duration</th>
                    <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Triggered By</th>
                    <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Time Saved</th>
                  </tr>
                </thead>
                <tbody className=\"bg-white divide-y divide-gray-200\">
                  {executions?.map((execution: any) => (
                    <tr key={execution.id} className=\"hover:bg-gray-50\">
                      <td className=\"px-6 py-4 whitespace-nowrap\">
                        <div className=\"flex items-center space-x-2\">
                          {getExecutionStatusIcon(execution.status)}
                          <span className=\"text-sm font-medium text-gray-900\">{execution.status}</span>
                        </div>
                        {execution.errorMessage && (
                          <div className=\"text-xs text-error-600 mt-1\">{execution.errorMessage}</div>
                        )}
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                        {new Date(execution.startTime).toLocaleString()}
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                        {execution.duration}s
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                        {execution.triggeredBy}
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                        {execution.timeSaved > 0 ? `${execution.timeSaved} min` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Workflow Settings</h3>
          </CardHeader>
          <CardBody>
            <div className=\"space-y-6\">
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">Schedule</label>
                <input
                  type=\"text\"
                  value={workflow.config.schedule}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                  placeholder=\"0 9 * * * (9 AM daily)\"
                />
                <p className=\"text-xs text-gray-500 mt-1\">Cron expression for scheduling</p>
              </div>
              
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">Notifications</label>
                <div className=\"space-y-2\">
                  <label className=\"flex items-center\">
                    <input type=\"checkbox\" checked={workflow.config.notifications.onSuccess} className=\"mr-2\" />
                    <span className=\"text-sm text-gray-700\">Notify on success</span>
                  </label>
                  <label className=\"flex items-center\">
                    <input type=\"checkbox\" checked={workflow.config.notifications.onFailure} className=\"mr-2\" />
                    <span className=\"text-sm text-gray-700\">Notify on failure</span>
                  </label>
                </div>
              </div>
              
              <div className=\"pt-4\">
                <Button variant=\"error\" leftIcon={<TrashIcon className=\"w-4 h-4\" />}>
                  Delete Workflow
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};", "original_text": "", "replace_all": false}]