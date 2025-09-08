import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  UserCircleIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  businessProfile: {
    industry: string;
    companySize: string;
    currentTools: string;
    painPoints: string;
    goals: string;
  };
}

interface PreferencesFormData {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  dashboard: {
    defaultPeriod: 'day' | 'week' | 'month' | 'year';
    defaultCharts: string[];
  };
}

export const UserSettings = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'subscription' | 'security'>('profile');
  const { user, updateProfile } = useAuthStore();
  
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      businessProfile: {
        industry: user?.businessProfile?.industry || '',
        companySize: user?.businessProfile?.companySize || '',
        currentTools: user?.businessProfile?.currentTools?.join(', ') || '',
        painPoints: user?.businessProfile?.painPoints?.join(', ') || '',
        goals: user?.businessProfile?.goals?.join(', ') || '',
      },
    },
  });

  const {
    register: registerPreferences,
    handleSubmit: handlePreferencesSubmit,
    watch: watchPreferences,
  } = useForm<PreferencesFormData>({
    defaultValues: {
      theme: user?.preferences?.theme || 'light',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        slack: user?.preferences?.notifications?.slack ?? false,
      },
      dashboard: {
        defaultPeriod: user?.preferences?.dashboard?.defaultPeriod || 'month',
        defaultCharts: user?.preferences?.dashboard?.defaultCharts || ['time-savings', 'cost-savings'],
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: PreferencesFormData) => updateProfile({ preferences: data }),
    onSuccess: () => {
      toast.success('Preferences updated successfully');
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    const updatedData = {
      ...data,
      businessProfile: {
        ...data.businessProfile,
        currentTools: data.businessProfile.currentTools.split(',').map(s => s.trim()).filter(Boolean),
        painPoints: data.businessProfile.painPoints.split(',').map(s => s.trim()).filter(Boolean),
        goals: data.businessProfile.goals.split(',').map(s => s.trim()).filter(Boolean),
      },
    };
    updateProfileMutation.mutate(updatedData);
  };

  const onPreferencesSubmit = (data: PreferencesFormData) => {
    updatePreferencesMutation.mutate(data);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'preferences', name: 'Preferences', icon: BellIcon },
    { id: 'subscription', name: 'Subscription', icon: CreditCardIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div>
        <h1 className=\"text-2xl font-bold text-gray-900\">Settings</h1>
        <p className=\"text-gray-600\">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className=\"border-b border-gray-200\">
        <nav className=\"-mb-px flex space-x-8\">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className=\"h-4 w-4\" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Profile Information</h3>
            <p className=\"text-sm text-gray-600\">Update your personal and business information</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className=\"space-y-6\">
              {/* Personal Information */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Personal Information</h4>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div>
                    <label htmlFor=\"name\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Full Name
                    </label>
                    <input
                      {...registerProfile('name', { required: 'Name is required' })}
                      type=\"text\"
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                    />
                    {profileErrors.name && (
                      <p className=\"mt-1 text-sm text-error-600\">{profileErrors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Email Address
                    </label>
                    <input
                      {...registerProfile('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type=\"email\"
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                    />
                    {profileErrors.email && (
                      <p className=\"mt-1 text-sm text-error-600\">{profileErrors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Profile */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Business Profile</h4>
                <div className=\"space-y-4\">
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div>
                      <label htmlFor=\"industry\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                        Industry
                      </label>
                      <select
                        {...registerProfile('businessProfile.industry')}
                        className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                      >
                        <option value=\"\">Select industry</option>
                        <option value=\"technology\">Technology</option>
                        <option value=\"marketing\">Marketing</option>
                        <option value=\"consulting\">Consulting</option>
                        <option value=\"ecommerce\">E-commerce</option>
                        <option value=\"healthcare\">Healthcare</option>
                        <option value=\"finance\">Finance</option>
                        <option value=\"education\">Education</option>
                        <option value=\"other\">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor=\"companySize\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                        Company Size
                      </label>
                      <select
                        {...registerProfile('businessProfile.companySize')}
                        className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                      >
                        <option value=\"\">Select size</option>
                        <option value=\"1-10\">1-10 employees</option>
                        <option value=\"11-50\">11-50 employees</option>
                        <option value=\"51-200\">51-200 employees</option>
                        <option value=\"201-1000\">201-1000 employees</option>
                        <option value=\"1000+\">1000+ employees</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor=\"currentTools\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Current Tools (comma-separated)
                    </label>
                    <input
                      {...registerProfile('businessProfile.currentTools')}
                      type=\"text\"
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                      placeholder=\"e.g., Gmail, Slack, Google Sheets, Notion\"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor=\"painPoints\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Pain Points (comma-separated)
                    </label>
                    <textarea
                      {...registerProfile('businessProfile.painPoints')}
                      rows={3}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                      placeholder=\"e.g., Manual data entry, Repetitive tasks, Communication gaps\"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor=\"goals\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Goals (comma-separated)
                    </label>
                    <textarea
                      {...registerProfile('businessProfile.goals')}
                      rows={3}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                      placeholder=\"e.g., Save time, Reduce errors, Improve efficiency\"
                    />
                  </div>
                </div>
              </div>

              <div className=\"flex justify-end\">
                <Button
                  type=\"submit\"
                  isLoading={updateProfileMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Preferences</h3>
            <p className=\"text-sm text-gray-600\">Customize your dashboard and notification settings</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)} className=\"space-y-6\">
              {/* Theme */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Appearance</h4>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Theme</label>
                  <div className=\"space-y-2\">
                    {[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }].map((option) => (
                      <label key={option.value} className=\"flex items-center\">
                        <input
                          {...registerPreferences('theme')}
                          type=\"radio\"
                          value={option.value}
                          className=\"mr-2 text-primary-600 focus:ring-primary-500\"
                        />
                        <span className=\"text-sm text-gray-700\">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Notifications</h4>
                <div className=\"space-y-3\">
                  <label className=\"flex items-center\">
                    <input
                      {...registerPreferences('notifications.email')}
                      type=\"checkbox\"
                      className=\"mr-3 text-primary-600 focus:ring-primary-500\"
                    />
                    <div>
                      <div className=\"text-sm font-medium text-gray-700\">Email notifications</div>
                      <div className=\"text-xs text-gray-500\">Receive workflow status updates via email</div>
                    </div>
                  </label>
                  <label className=\"flex items-center\">
                    <input
                      {...registerPreferences('notifications.push')}
                      type=\"checkbox\"
                      className=\"mr-3 text-primary-600 focus:ring-primary-500\"
                    />
                    <div>
                      <div className=\"text-sm font-medium text-gray-700\">Push notifications</div>
                      <div className=\"text-xs text-gray-500\">Receive browser notifications</div>
                    </div>
                  </label>
                  <label className=\"flex items-center\">
                    <input
                      {...registerPreferences('notifications.slack')}
                      type=\"checkbox\"
                      className=\"mr-3 text-primary-600 focus:ring-primary-500\"
                    />
                    <div>
                      <div className=\"text-sm font-medium text-gray-700\">Slack notifications</div>
                      <div className=\"text-xs text-gray-500\">Send notifications to your Slack workspace</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dashboard */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Dashboard</h4>
                <div className=\"space-y-4\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">Default time period</label>
                    <select
                      {...registerPreferences('dashboard.defaultPeriod')}
                      className=\"w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                    >
                      <option value=\"day\">Today</option>
                      <option value=\"week\">This Week</option>
                      <option value=\"month\">This Month</option>
                      <option value=\"year\">This Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className=\"flex justify-end\">
                <Button
                  type=\"submit\"
                  isLoading={updatePreferencesMutation.isPending}
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {activeTab === 'subscription' && (
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Subscription</h3>
            <p className=\"text-sm text-gray-600\">Manage your subscription and billing</p>
          </CardHeader>
          <CardBody>
            <div className=\"space-y-6\">
              {/* Current Plan */}
              <div className=\"bg-primary-50 p-4 rounded-lg\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <h4 className=\"text-lg font-medium text-gray-900\">
                      {user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1)} Plan
                    </h4>
                    <p className=\"text-sm text-gray-600\">
                      {user?.subscriptionTier === 'free' && 'Limited to 5 workflows and 100 executions per month'}
                      {user?.subscriptionTier === 'starter' && 'Up to 25 workflows and 1,000 executions per month'}
                      {user?.subscriptionTier === 'pro' && 'Up to 100 workflows and 10,000 executions per month'}
                      {user?.subscriptionTier === 'business' && 'Unlimited workflows and executions'}
                    </p>
                  </div>
                  <div className=\"text-right\">
                    <div className=\"text-2xl font-bold text-gray-900\">
                      {user?.subscriptionTier === 'free' && '$0'}
                      {user?.subscriptionTier === 'starter' && '$29'}
                      {user?.subscriptionTier === 'pro' && '$99'}
                      {user?.subscriptionTier === 'business' && '$299'}
                    </div>
                    <div className=\"text-sm text-gray-500\">per month</div>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Current Usage</h4>
                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
                  <div className=\"bg-gray-50 p-4 rounded-lg\">
                    <div className=\"text-2xl font-bold text-gray-900\">12</div>
                    <div className=\"text-sm text-gray-600\">Active Workflows</div>
                    <div className=\"text-xs text-gray-500 mt-1\">
                      {user?.subscriptionTier === 'free' ? 'of 5 limit' : 
                       user?.subscriptionTier === 'starter' ? 'of 25 limit' :
                       user?.subscriptionTier === 'pro' ? 'of 100 limit' : 'unlimited'}
                    </div>
                  </div>
                  <div className=\"bg-gray-50 p-4 rounded-lg\">
                    <div className=\"text-2xl font-bold text-gray-900\">1,234</div>
                    <div className=\"text-sm text-gray-600\">Executions This Month</div>
                    <div className=\"text-xs text-gray-500 mt-1\">
                      {user?.subscriptionTier === 'free' ? 'of 100 limit' : 
                       user?.subscriptionTier === 'starter' ? 'of 1,000 limit' :
                       user?.subscriptionTier === 'pro' ? 'of 10,000 limit' : 'unlimited'}
                    </div>
                  </div>
                  <div className=\"bg-gray-50 p-4 rounded-lg\">
                    <div className=\"text-2xl font-bold text-gray-900\">8</div>
                    <div className=\"text-sm text-gray-600\">Connected Integrations</div>
                    <div className=\"text-xs text-gray-500 mt-1\">unlimited</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className=\"flex space-x-4\">
                {user?.subscriptionTier !== 'business' && (
                  <Button>
                    Upgrade Plan
                  </Button>
                )}
                <Button variant=\"ghost\">
                  View Billing History
                </Button>
                <Button variant=\"ghost\">
                  Download Invoice
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <h3 className=\"text-lg font-semibold text-gray-900\">Security</h3>
            <p className=\"text-sm text-gray-600\">Manage your account security settings</p>
          </CardHeader>
          <CardBody>
            <div className=\"space-y-6\">
              {/* Password */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Password</h4>
                <div className=\"bg-gray-50 p-4 rounded-lg\">
                  <div className=\"flex items-center justify-between\">
                    <div>
                      <div className=\"font-medium text-gray-900\">Password</div>
                      <div className=\"text-sm text-gray-600\">Last changed 30 days ago</div>
                    </div>
                    <Button variant=\"ghost\" leftIcon={<KeyIcon className=\"w-4 h-4\" />}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">Two-Factor Authentication</h4>
                <div className=\"bg-gray-50 p-4 rounded-lg\">
                  <div className=\"flex items-center justify-between\">
                    <div>
                      <div className=\"font-medium text-gray-900\">Two-Factor Authentication</div>
                      <div className=\"text-sm text-gray-600\">Add an extra layer of security to your account</div>
                    </div>
                    <Button variant=\"ghost\">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div>
                <h4 className=\"text-md font-medium text-gray-900 mb-4\">API Keys</h4>
                <div className=\"bg-gray-50 p-4 rounded-lg\">
                  <div className=\"flex items-center justify-between\">
                    <div>
                      <div className=\"font-medium text-gray-900\">API Access</div>
                      <div className=\"text-sm text-gray-600\">Manage API keys for external integrations</div>
                    </div>
                    <Button variant=\"ghost\">
                      Manage API Keys
                    </Button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h4 className=\"text-md font-medium text-error-600 mb-4\">Danger Zone</h4>
                <div className=\"bg-error-50 border border-error-200 p-4 rounded-lg\">
                  <div className=\"flex items-center justify-between\">
                    <div>
                      <div className=\"font-medium text-error-900\">Delete Account</div>
                      <div className=\"text-sm text-error-700\">
                        Permanently delete your account and all associated data
                      </div>
                    </div>
                    <Button variant=\"error\">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};", "original_text": "", "replace_all": false}]