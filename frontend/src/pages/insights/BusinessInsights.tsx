import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { aiApi } from '../../services/api';
import {
  LightBulbIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

// Mock insights data
const mockInsights = [
  {
    id: '1',
    type: 'recommendation',
    title: 'Automate Invoice Processing',
    description: 'Based on your email patterns, you could save 15 hours/month by automating invoice processing from email attachments.',
    potentialSavings: 450,
    implementationEffort: 'medium',
    priority: 1,
    status: 'new',
    category: 'automation',
    actionItems: [
      'Set up email filtering for invoices',
      'Create OCR extraction workflow',
      'Connect to accounting system',
    ],
    createdAt: '2024-01-07T10:00:00Z',
  },
  {
    id: '2',
    type: 'optimization',
    title: 'Optimize Email to Sheets Sync',
    description: 'Your current workflow could be 30% faster with batch processing and better error handling.',
    potentialSavings: 180,
    implementationEffort: 'low',
    priority: 2,
    status: 'new',
    category: 'performance',
    actionItems: [
      'Enable batch processing',
      'Add retry logic for failures',
      'Optimize data transformation',
    ],
    createdAt: '2024-01-07T09:30:00Z',
  },
  {
    id: '3',
    type: 'alert',
    title: 'High Failure Rate Detected',
    description: 'Your Slack notification workflow has a 15% failure rate this week due to API rate limits.',
    potentialSavings: 0,
    implementationEffort: 'low',
    priority: 3,
    status: 'viewed',
    category: 'maintenance',
    actionItems: [
      'Review Slack API usage',
      'Implement rate limiting',
      'Add fallback notification methods',
    ],
    createdAt: '2024-01-06T14:20:00Z',
  },
  {
    id: '4',
    type: 'benchmark',
    title: 'Industry Benchmark Comparison',
    description: 'Your automation efficiency is 20% above industry average for marketing agencies.',
    potentialSavings: 0,
    implementationEffort: 'low',
    priority: 4,
    status: 'new',
    category: 'insights',
    actionItems: [
      'Share best practices with team',
      'Document successful workflows',
      'Consider offering automation consulting',
    ],
    createdAt: '2024-01-05T16:45:00Z',
  },
];

type InsightStatus = 'new' | 'viewed' | 'implemented' | 'dismissed';
type InsightType = 'recommendation' | 'optimization' | 'alert' | 'benchmark';

export const BusinessInsights = () => {
  const [selectedType, setSelectedType] = useState<InsightType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<InsightStatus | 'all'>('all');

  // Using mock data for now
  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => Promise.resolve(mockInsights),
    // queryFn: () => aiApi.getRecommendations(),
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ insightId, status }: { insightId: string; status: InsightStatus }) => {
      // Mock update - replace with actual API call
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      refetch();
      toast.success('Insight updated successfully');
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => {
      // Mock generation - replace with actual AI analysis
      return Promise.resolve({ success: true, data: [] });
    },
    onSuccess: () => {
      refetch();
      toast.success('New insights generated!');
    },
  });

  const filteredInsights = insights?.filter((insight: any) => {
    const typeMatch = selectedType === 'all' || insight.type === selectedType;
    const statusMatch = selectedStatus === 'all' || insight.status === selectedStatus;
    return typeMatch && statusMatch;
  }) || [];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <LightBulbIcon className=\"h-5 w-5\" />;
      case 'optimization':
        return <ChartBarIcon className=\"h-5 w-5\" />;
      case 'alert':
        return <ExclamationTriangleIcon className=\"h-5 w-5\" />;
      case 'benchmark':
        return <CheckCircleIcon className=\"h-5 w-5\" />;
      default:
        return <LightBulbIcon className=\"h-5 w-5\" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'recommendation':
        return 'text-primary-600 bg-primary-100';
      case 'optimization':
        return 'text-success-600 bg-success-100';
      case 'alert':
        return 'text-error-600 bg-error-100';
      case 'benchmark':
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-error-100 text-error-800';
    if (priority <= 4) return 'bg-warning-100 text-warning-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-success-100 text-success-800';
      case 'medium':
        return 'bg-warning-100 text-warning-800';
      case 'high':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
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
          <h1 className=\"text-2xl font-bold text-gray-900\">AI Business Insights</h1>
          <p className=\"text-gray-600\">Discover optimization opportunities and get intelligent recommendations</p>
        </div>
        <Button
          onClick={() => generateInsightsMutation.mutate()}
          leftIcon={<SparklesIcon className=\"w-4 h-4\" />}
          isLoading={generateInsightsMutation.isPending}
        >
          Generate New Insights
        </Button>
      </div>

      {/* Summary Cards */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
        <Card>
          <CardBody className=\"text-center\">
            <div className=\"text-2xl font-bold text-primary-600\">
              {insights?.filter((i: any) => i.status === 'new').length || 0}
            </div>
            <div className=\"text-sm text-gray-600\">New Insights</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className=\"text-center\">
            <div className=\"text-2xl font-bold text-success-600\">
              {insights?.filter((i: any) => i.status === 'implemented').length || 0}
            </div>
            <div className=\"text-sm text-gray-600\">Implemented</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className=\"text-center\">
            <div className=\"text-2xl font-bold text-warning-600\">
              ${insights?.reduce((sum: number, i: any) => sum + (i.potentialSavings || 0), 0).toLocaleString() || 0}
            </div>
            <div className=\"text-sm text-gray-600\">Potential Savings</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className=\"text-center\">
            <div className=\"text-2xl font-bold text-gray-900\">
              {insights?.filter((i: any) => i.priority <= 2).length || 0}
            </div>
            <div className=\"text-sm text-gray-600\">High Priority</div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className=\"flex flex-col sm:flex-row gap-4\">
            <div className=\"flex-1\">
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">Filter by Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className=\"w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500\"
              >
                <option value=\"all\">All Types</option>
                <option value=\"recommendation\">Recommendations</option>
                <option value=\"optimization\">Optimizations</option>
                <option value=\"alert\">Alerts</option>
                <option value=\"benchmark\">Benchmarks</option>
              </select>
            </div>
            <div className=\"flex-1\">
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">Filter by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className=\"w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500\"
              >
                <option value=\"all\">All Status</option>
                <option value=\"new\">New</option>
                <option value=\"viewed\">Viewed</option>
                <option value=\"implemented\">Implemented</option>
                <option value=\"dismissed\">Dismissed</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <Card>
          <CardBody>
            <div className=\"text-center py-12\">
              <LightBulbIcon className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />
              <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No insights found</h3>
              <p className=\"text-gray-600 mb-4\">
                {selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or generate new insights.'
                  : 'Generate your first AI insights to get started.'}
              </p>
              <Button
                onClick={() => generateInsightsMutation.mutate()}
                leftIcon={<SparklesIcon className=\"w-4 h-4\" />}
              >
                Generate Insights
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className=\"space-y-4\">
          {filteredInsights.map((insight: any) => (
            <Card key={insight.id}>
              <CardBody>
                <div className=\"flex items-start justify-between\">
                  <div className=\"flex items-start space-x-3 flex-1\">
                    <div className={clsx('p-2 rounded-lg', getInsightColor(insight.type))}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className=\"flex-1\">
                      <div className=\"flex items-center space-x-2 mb-2\">
                        <h3 className=\"text-lg font-semibold text-gray-900\">{insight.title}</h3>
                        <span className={clsx('inline-flex px-2 py-1 text-xs font-medium rounded-full', getPriorityColor(insight.priority))}>
                          {insight.priority <= 2 ? 'High' : insight.priority <= 4 ? 'Medium' : 'Low'} Priority
                        </span>
                        <span className={clsx('inline-flex px-2 py-1 text-xs font-medium rounded-full', getEffortColor(insight.implementationEffort))}>
                          {insight.implementationEffort} effort
                        </span>
                      </div>
                      <p className=\"text-gray-600 mb-4\">{insight.description}</p>
                      
                      {insight.potentialSavings > 0 && (
                        <div className=\"flex items-center space-x-4 mb-4 text-sm\">
                          <div className=\"flex items-center space-x-1 text-success-600\">
                            <CurrencyDollarIcon className=\"h-4 w-4\" />
                            <span>${insight.potentialSavings}/month potential savings</span>
                          </div>
                        </div>
                      )}
                      
                      {insight.actionItems && insight.actionItems.length > 0 && (
                        <div>
                          <h4 className=\"text-sm font-medium text-gray-900 mb-2\">Action Items:</h4>
                          <ul className=\"space-y-1\">
                            {insight.actionItems.map((item: string, index: number) => (
                              <li key={index} className=\"flex items-center space-x-2 text-sm text-gray-600\">
                                <div className=\"w-1.5 h-1.5 bg-gray-400 rounded-full\" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className=\"flex items-center space-x-2 ml-4\">
                    {insight.status === 'new' && (
                      <>
                        <Button
                          size=\"sm\"
                          onClick={() => updateInsightMutation.mutate({ insightId: insight.id, status: 'implemented' })}
                        >
                          Mark Implemented
                        </Button>
                        <Button
                          variant=\"ghost\"
                          size=\"sm\"
                          onClick={() => updateInsightMutation.mutate({ insightId: insight.id, status: 'dismissed' })}
                          leftIcon={<XMarkIcon className=\"w-4 h-4\" />}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {insight.status === 'viewed' && (
                      <Button
                        size=\"sm\"
                        onClick={() => updateInsightMutation.mutate({ insightId: insight.id, status: 'implemented' })}
                      >
                        Mark Implemented
                      </Button>
                    )}
                    {insight.status === 'implemented' && (
                      <span className=\"inline-flex items-center px-3 py-1 text-sm font-medium text-success-800 bg-success-100 rounded-full\">
                        <CheckCircleIcon className=\"w-4 h-4 mr-1\" />
                        Implemented
                      </span>
                    )}
                    {insight.status === 'dismissed' && (
                      <span className=\"inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full\">
                        <XMarkIcon className=\"w-4 h-4 mr-1\" />
                        Dismissed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className=\"mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500\">
                  <span>Created: {new Date(insight.createdAt).toLocaleDateString()}</span>
                  <span className=\"capitalize\">{insight.category}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};", "original_text": "", "replace_all": false}]