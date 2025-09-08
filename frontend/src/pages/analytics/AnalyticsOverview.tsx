import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { analyticsApi } from '../../services/api';
import {
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { clsx } from 'clsx';

// Mock data for demo
const mockAnalytics = {
  totalTimeSaved: 324.5,
  totalCostSaved: 8750,
  workflowsExecuted: 156,
  successRate: 96.8,
  activeWorkflows: 12,
};

const mockTimeSavingsChart = [
  { date: '2024-01-01', hours: 12 },
  { date: '2024-01-02', hours: 18 },
  { date: '2024-01-03', hours: 24 },
  { date: '2024-01-04', hours: 28 },
  { date: '2024-01-05', hours: 35 },
  { date: '2024-01-06', hours: 42 },
  { date: '2024-01-07', hours: 38 },
  { date: '2024-01-08', hours: 45 },
  { date: '2024-01-09', hours: 52 },
  { date: '2024-01-10', hours: 48 },
];

const mockCostSavingsChart = [
  { date: '2024-01-01', amount: 450 },
  { date: '2024-01-02', amount: 680 },
  { date: '2024-01-03', amount: 920 },
  { date: '2024-01-04', amount: 1200 },
  { date: '2024-01-05', amount: 1580 },
  { date: '2024-01-06', amount: 1920 },
  { date: '2024-01-07', amount: 2100 },
  { date: '2024-01-08', amount: 2450 },
  { date: '2024-01-09', amount: 2800 },
  { date: '2024-01-10', amount: 3200 },
];

const mockWorkflowPerformance = [
  { name: 'Email to Sheets', executions: 48, timeSaved: 96, successRate: 98.5 },
  { name: 'Slack Notifications', executions: 32, timeSaved: 64, successRate: 96.2 },
  { name: 'Invoice Processing', executions: 24, timeSaved: 120, successRate: 92.0 },
  { name: 'Customer Onboarding', executions: 16, timeSaved: 80, successRate: 100 },
  { name: 'Report Generation', executions: 12, timeSaved: 60, successRate: 94.5 },
];

const mockExecutionsByStatus = [
  { name: 'Successful', value: 142, color: '#22c55e' },
  { name: 'Failed', value: 8, color: '#ef4444' },
  { name: 'Cancelled', value: 6, color: '#f59e0b' },
];

type Period = 'day' | 'week' | 'month' | 'year';

export const AnalyticsOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedChart, setSelectedChart] = useState<'time' | 'cost' | 'workflows'>('time');

  // Using mock data for now
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedPeriod],
    queryFn: () => Promise.resolve(mockAnalytics),
    // queryFn: () => analyticsApi.getAnalytics(selectedPeriod),
  });

  const { data: timeSavings } = useQuery({
    queryKey: ['time-savings', selectedPeriod],
    queryFn: () => Promise.resolve(mockTimeSavingsChart),
    // queryFn: () => analyticsApi.getTimeSavings(selectedPeriod),
  });

  const { data: costSavings } = useQuery({
    queryKey: ['cost-savings', selectedPeriod],
    queryFn: () => Promise.resolve(mockCostSavingsChart),
    // queryFn: () => analyticsApi.getCostSavings(selectedPeriod),
  });

  const { data: workflowPerformance } = useQuery({
    queryKey: ['workflow-performance'],
    queryFn: () => Promise.resolve(mockWorkflowPerformance),
    // queryFn: () => analyticsApi.getWorkflowPerformance(),
  });

  if (analyticsLoading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <LoadingSpinner size=\"lg\" />
      </div>
    );
  }

  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const getChartData = () => {
    switch (selectedChart) {
      case 'cost':
        return costSavings;
      case 'workflows':
        return workflowPerformance;
      default:
        return timeSavings;
    }
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return '+100';
    const change = ((current - previous) / previous * 100);
    return change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
  };

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">Analytics Overview</h1>
          <p className=\"text-gray-600\">Track your automation performance and ROI metrics</p>
        </div>
        
        {/* Period Selector */}
        <div className=\"flex items-center space-x-2\">
          <CalendarDaysIcon className=\"h-4 w-4 text-gray-400\" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as Period)}
            className=\"border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500\"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        <MetricCard
          title=\"Time Saved\"
          value={`${analytics?.totalTimeSaved || 0}h`}
          change={{
            value: getChangePercentage(analytics?.totalTimeSaved || 0, 280) + '%',
            type: \"increase\"
          }}
          icon={<ClockIcon />}
          description={`Across ${analytics?.workflowsExecuted || 0} executions`}
        />
        <MetricCard
          title=\"Cost Savings\"
          value={`$${(analytics?.totalCostSaved || 0).toLocaleString()}`}
          change={{
            value: getChangePercentage(analytics?.totalCostSaved || 0, 7200) + '%',
            type: \"increase\"
          }}
          icon={<CurrencyDollarIcon />}
          description=\"Total monetary savings\"
        />
        <MetricCard
          title=\"Success Rate\"
          value={`${analytics?.successRate || 0}%`}
          change={{
            value: getChangePercentage(analytics?.successRate || 0, 94.2) + '%',
            type: analytics?.successRate && analytics.successRate > 94.2 ? \"increase\" : \"decrease\"
          }}
          icon={<ChartBarIcon />}
          description=\"Average across all workflows\"
        />
        <MetricCard
          title=\"ROI This Month\"
          value=\"480%\"
          change={{
            value: \"+12.5%\",
            type: \"increase\"
          }}
          icon={<TrendingUpIcon />}
          description=\"Return on investment\"
        />
      </div>

      {/* Charts Section */}
      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Main Chart */}
        <div className=\"lg:col-span-2\">
          <Card>
            <CardHeader>
              <div className=\"flex justify-between items-center\">
                <h3 className=\"text-lg font-semibold text-gray-900\">
                  {selectedChart === 'time' ? 'Time Savings Trend' :
                   selectedChart === 'cost' ? 'Cost Savings Trend' : 'Workflow Performance'}
                </h3>
                <div className=\"flex space-x-2\">
                  {[{ id: 'time', label: 'Time' }, { id: 'cost', label: 'Cost' }, { id: 'workflows', label: 'Workflows' }].map((chart) => (
                    <Button
                      key={chart.id}
                      variant={selectedChart === chart.id ? 'primary' : 'ghost'}
                      size=\"sm\"
                      onClick={() => setSelectedChart(chart.id as any)}
                    >
                      {chart.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className=\"h-80\">
                <ResponsiveContainer width=\"100%\" height=\"100%\">
                  {selectedChart === 'workflows' ? (
                    <BarChart data={workflowPerformance}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis dataKey=\"name\" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          if (name === 'timeSaved') return [`${value}h`, 'Time Saved'];
                          if (name === 'successRate') return [`${value}%`, 'Success Rate'];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey=\"timeSaved\" fill=\"#3b82f6\" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : selectedChart === 'cost' ? (
                    <AreaChart data={costSavings}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis 
                        dataKey=\"date\" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: any) => [`$${value}`, 'Cost Saved']}
                      />
                      <Area 
                        type=\"monotone\" 
                        dataKey=\"amount\" 
                        stroke=\"#22c55e\" 
                        fill=\"#22c55e\" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={timeSavings}>
                      <CartesianGrid strokeDasharray=\"3 3\" />
                      <XAxis 
                        dataKey=\"date\" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: any) => [`${value}h`, 'Time Saved']}
                      />
                      <Line 
                        type=\"monotone\" 
                        dataKey=\"hours\" 
                        stroke=\"#3b82f6\" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Execution Status Pie Chart */}
        <div>
          <Card>
            <CardHeader>
              <h3 className=\"text-lg font-semibold text-gray-900\">Execution Status</h3>
              <p className=\"text-sm text-gray-600\">Last 30 days</p>
            </CardHeader>
            <CardBody>
              <div className=\"h-64\">
                <ResponsiveContainer width=\"100%\" height=\"100%\">
                  <PieChart>
                    <Pie
                      data={mockExecutionsByStatus}
                      cx=\"50%\"
                      cy=\"50%\"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey=\"value\"
                    >
                      {mockExecutionsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Executions']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className=\"mt-4 space-y-2\">
                {mockExecutionsByStatus.map((item) => (
                  <div key={item.name} className=\"flex items-center justify-between\">
                    <div className=\"flex items-center space-x-2\">
                      <div 
                        className=\"w-3 h-3 rounded-full\" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className=\"text-sm text-gray-600\">{item.name}</span>
                    </div>
                    <span className=\"text-sm font-medium text-gray-900\">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Workflow Performance Table */}
      <Card>
        <CardHeader>
          <h3 className=\"text-lg font-semibold text-gray-900\">Top Performing Workflows</h3>
          <p className=\"text-sm text-gray-600\">Ranked by time saved in the selected period</p>
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
                    Executions
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Time Saved
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Success Rate
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody className=\"bg-white divide-y divide-gray-200\">
                {workflowPerformance?.map((workflow: any, index: number) => (
                  <tr key={workflow.name} className=\"hover:bg-gray-50\">
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <div className=\"flex items-center\">
                        <div className=\"flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium\">
                          {index + 1}
                        </div>
                        <div className=\"ml-3\">
                          <div className=\"text-sm font-medium text-gray-900\">{workflow.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                      {workflow.executions}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                      {workflow.timeSaved}h
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <div className=\"flex items-center\">
                        <div className=\"text-sm text-gray-900\">{workflow.successRate}%</div>
                        <div className=\"ml-2 w-16 bg-gray-200 rounded-full h-2\">
                          <div 
                            className=\"bg-success-600 h-2 rounded-full\" 
                            style={{ width: `${workflow.successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <div className={clsx(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        workflow.successRate > 95 ? 'bg-success-100 text-success-800' :
                        workflow.successRate > 90 ? 'bg-warning-100 text-warning-800' :
                        'bg-error-100 text-error-800'
                      )}>
                        {workflow.successRate > 95 ? 'Excellent' :
                         workflow.successRate > 90 ? 'Good' : 'Needs Attention'}
                      </div>
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