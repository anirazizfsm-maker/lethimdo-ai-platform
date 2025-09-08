import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { analyticsApi, workflowApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  ClockIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for demo
const mockAnalytics = {
  totalTimeSaved: 156.5,
  totalCostSaved: 4250,
  activeWorkflows: 12,
  successRate: 94.2,
  timeSavingsChart: [
    { date: '2024-01-01', hours: 8 },
    { date: '2024-01-02', hours: 12 },
    { date: '2024-01-03', hours: 15 },
    { date: '2024-01-04', hours: 18 },
    { date: '2024-01-05', hours: 22 },
    { date: '2024-01-06', hours: 28 },
    { date: '2024-01-07', hours: 32 },
  ],
  costSavingsChart: [
    { date: '2024-01-01', amount: 450 },
    { date: '2024-01-02', amount: 680 },
    { date: '2024-01-03', amount: 890 },
    { date: '2024-01-04', amount: 1200 },
    { date: '2024-01-05', amount: 1580 },
    { date: '2024-01-06', amount: 1920 },
    { date: '2024-01-07', amount: 2350 },
  ],
};

const mockWorkflows = [
  { id: '1', name: 'Email to Sheets Sync', status: 'active', lastExecuted: '2024-01-07T10:30:00Z', successRate: 98 },
  { id: '2', name: 'Slack Notifications', status: 'active', lastExecuted: '2024-01-07T09:15:00Z', successRate: 96 },
  { id: '3', name: 'Invoice Processing', status: 'paused', lastExecuted: '2024-01-06T14:20:00Z', successRate: 92 },
  { id: '4', name: 'Customer Onboarding', status: 'active', lastExecuted: '2024-01-07T11:45:00Z', successRate: 100 },
];

export const DashboardOverview = () => {
  // Using mock data for now - replace with real API calls when backend is ready
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'monthly'],
    queryFn: () => Promise.resolve(mockAnalytics),
    // queryFn: () => analyticsApi.getAnalytics('monthly'),
  });

  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => Promise.resolve(mockWorkflows),
    // queryFn: () => workflowApi.getWorkflows({ limit: 5 }),
  });

  if (analyticsLoading || workflowsLoading) {
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
          <h1 className=\"text-2xl font-bold text-gray-900\">Dashboard Overview</h1>
          <p className=\"text-gray-600\">Welcome back! Here's what's happening with your workflows.</p>
        </div>
        <Link to=\"/dashboard/workflows/new\">
          <Button leftIcon={<PlusIcon className=\"w-4 h-4\" />}>
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        <MetricCard
          title=\"Time Saved This Month\"
          value={`${analytics?.totalTimeSaved || 0} hours`}
          change={{
            value: \"+12.5%\",
            type: \"increase\"
          }}
          icon={<ClockIcon />}
          description=\"Compared to last month\"
        />
        <MetricCard
          title=\"Cost Savings\"
          value={`$${(analytics?.totalCostSaved || 0).toLocaleString()}`}
          change={{
            value: \"+8.3%\",
            type: \"increase\"
          }}
          icon={<CurrencyDollarIcon />}
          description=\"Total savings this month\"
        />
        <MetricCard
          title=\"Active Workflows\"
          value={analytics?.activeWorkflows || 0}
          change={{
            value: \"+2\",
            type: \"increase\"
          }}
          icon={<BoltIcon />}
          description=\"Currently running\"
        />
        <MetricCard
          title=\"Success Rate\"
          value={`${analytics?.successRate || 0}%`}
          change={{
            value: \"+1.2%\",
            type: \"increase\"
          }}
          icon={<ChartBarIcon />}
          description=\"Average success rate\"
        />
      </div>

      {/* Charts Row */}
      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        {/* Time Savings Chart */}
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Time Savings Trend</h3>
            <p className=\"text-sm text-gray-600\">Daily hours saved over the last week</p>
          </CardHeader>
          <CardBody>
            <div className=\"h-64\">
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                <AreaChart data={analytics?.timeSavingsChart || []}>
                  <CartesianGrid strokeDasharray=\"3 3\" />
                  <XAxis 
                    dataKey=\"date\" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [`${value} hours`, 'Time Saved']}
                  />
                  <Area 
                    type=\"monotone\" 
                    dataKey=\"hours\" 
                    stroke=\"#3b82f6\" 
                    fill=\"#3b82f6\" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Cost Savings Chart */}
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Cost Savings Trend</h3>
            <p className=\"text-sm text-gray-600\">Cumulative cost savings over time</p>
          </CardHeader>
          <CardBody>
            <div className=\"h-64\">
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                <LineChart data={analytics?.costSavingsChart || []}>
                  <CartesianGrid strokeDasharray=\"3 3\" />
                  <XAxis 
                    dataKey=\"date\" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [`$${value}`, 'Cost Saved']}
                  />
                  <Line 
                    type=\"monotone\" 
                    dataKey=\"amount\" 
                    stroke=\"#22c55e\" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Workflows */}
      <Card>
        <CardHeader>
          <div className=\"flex justify-between items-center\">
            <div>
              <h3 className=\"text-lg font-semibold text-gray-900\">Recent Workflows</h3>
              <p className=\"text-sm text-gray-600\">Your most recently active workflows</p>
            </div>
            <Link to=\"/dashboard/workflows\">
              <Button variant=\"ghost\" size=\"sm\">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          <div className=\"overflow-x-auto\">
            <table className=\"min-w-full divide-y divide-gray-200\">
              <thead className=\"bg-gray-50\">
                <tr>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Workflow
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Status
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Last Executed
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Success Rate
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className=\"bg-white divide-y divide-gray-200\">
                {workflows?.map((workflow: any) => (
                  <tr key={workflow.id} className=\"hover:bg-gray-50\">
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <div className=\"text-sm font-medium text-gray-900\">{workflow.name}</div>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        workflow.status === 'active' ? 'status-active' :
                        workflow.status === 'paused' ? 'status-paused' :
                        'status-failed'
                      }`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                      {new Date(workflow.lastExecuted).toLocaleString()}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                      {workflow.successRate}%
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm font-medium\">
                      <Link 
                        to={`/dashboard/workflows/${workflow.id}`}
                        className=\"text-primary-600 hover:text-primary-900\"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};", "original_text": "", "replace_all": false}]