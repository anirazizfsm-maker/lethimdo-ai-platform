import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  icon,
  description,
  className,
}: MetricCardProps) => {
  const changeColors = {
    increase: 'text-success-600',
    decrease: 'text-error-600',
    neutral: 'text-gray-600',
  };

  const changeIcons = {
    increase: '↗',
    decrease: '↘',
    neutral: '→',
  };

  return (
    <Card className={clsx('metric-card', className)} hover>
      <div className=\"flex items-center justify-between\">
        <div className=\"flex-1\">
          <p className=\"text-sm text-gray-600 mb-1\">{title}</p>
          <p className=\"text-2xl font-bold text-gray-900 mb-1\">{value}</p>
          {change && (
            <p className={clsx('text-sm flex items-center', changeColors[change.type])}>
              <span className=\"mr-1\">{changeIcons[change.type]}</span>
              {change.value}
            </p>
          )}
          {description && (
            <p className=\"text-xs text-gray-500 mt-2\">{description}</p>
          )}
        </div>
        {icon && (
          <div className=\"flex-shrink-0 ml-4\">
            <div className=\"p-3 bg-primary-50 rounded-lg\">
              <div className=\"w-6 h-6 text-primary-600\">{icon}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};", "original_text": "", "replace_all": false}]