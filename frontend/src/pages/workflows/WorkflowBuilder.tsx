import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { workflowApi, aiApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  SparklesIcon,
  BoltIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WorkflowFormData {
  name: string;
  description: string;
  naturalLanguageInput: string;
}

export const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'preview' | 'creating'>('input');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkflowFormData>();

  const naturalLanguageInput = watch('naturalLanguageInput');

  // AI workflow generation mutation
  const generateWorkflowMutation = useMutation({
    mutationFn: (data: { description: string }) => {
      // For demo purposes, return mock generated workflow
      return Promise.resolve({
        success: true,
        data: {
          name: `Auto-generated: ${data.description.substring(0, 50)}`,
          description: `Workflow generated from: \"${data.description}\"`,
          estimatedTimeSavings: Math.floor(Math.random() * 60) + 10,
          estimatedCostSavings: Math.floor(Math.random() * 200) + 50,
          steps: [
            { id: 1, type: 'trigger', name: 'Email Received', description: 'When a new email is received' },
            { id: 2, type: 'action', name: 'Extract Data', description: 'Extract relevant information from the email' },
            { id: 3, type: 'action', name: 'Update Spreadsheet', description: 'Add extracted data to Google Sheets' },
            { id: 4, type: 'action', name: 'Send Notification', description: 'Send confirmation notification' },
          ],
          integrations: ['Gmail', 'Google Sheets', 'Slack'],
        },
      });
      // return aiApi.generateWorkflow(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        setGeneratedWorkflow(response.data);
        setStep('preview');
      }
    },
    onError: () => {
      toast.error('Failed to generate workflow. Please try again.');
    },
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: (data: WorkflowFormData) => {
      // For demo purposes, return success
      return Promise.resolve({
        success: true,
        data: {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
      });
      // return workflowApi.createWorkflow(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Workflow created successfully!');
        navigate(`/dashboard/workflows/${response.data.id}`);
      }
    },
    onError: () => {
      toast.error('Failed to create workflow. Please try again.');
    },
  });

  const onGenerateWorkflow = async (data: WorkflowFormData) => {
    setStep('creating');
    generateWorkflowMutation.mutate({ description: data.naturalLanguageInput });
  };

  const onCreateWorkflow = async (data: WorkflowFormData) => {
    createWorkflowMutation.mutate({
      ...data,
      name: generatedWorkflow?.name || data.name,
      description: generatedWorkflow?.description || data.description,
    });
  };

  const handleBack = () => {
    if (step === 'preview') {
      setStep('input');
      setGeneratedWorkflow(null);
    } else {
      navigate('/dashboard/workflows');
    }
  };

  return (
    <div className=\"max-w-4xl mx-auto space-y-6\">
      {/* Header */}
      <div>
        <h1 className=\"text-2xl font-bold text-gray-900\">Create New Workflow</h1>
        <p className=\"text-gray-600\">Describe your automation needs in natural language and let AI build your workflow</p>
      </div>

      {/* Progress Steps */}
      <div className=\"flex items-center space-x-4 mb-8\">
        <div className={`flex items-center space-x-2 ${step === 'input' ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'input' ? 'bg-primary-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className=\"font-medium\">Describe Workflow</span>
        </div>
        <ArrowRightIcon className=\"h-4 w-4 text-gray-400\" />
        <div className={`flex items-center space-x-2 ${
          step === 'preview' || step === 'creating' ? 'text-primary-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'preview' || step === 'creating' ? 'bg-primary-600 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className=\"font-medium\">AI Generation</span>
        </div>
        <ArrowRightIcon className=\"h-4 w-4 text-gray-400\" />
        <div className=\"flex items-center space-x-2 text-gray-400\">
          <div className=\"w-8 h-8 rounded-full flex items-center justify-center bg-gray-200\">
            3
          </div>
          <span className=\"font-medium\">Review & Create</span>
        </div>
      </div>

      {/* Step Content */}
      {step === 'input' && (
        <Card>
          <CardHeader>
            <h2 className=\"text-lg font-semibold text-gray-900\">Describe Your Workflow</h2>
            <p className=\"text-sm text-gray-600\">Tell us what you want to automate in plain English</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onGenerateWorkflow)} className=\"space-y-6\">
              <div>
                <label htmlFor=\"naturalLanguageInput\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                  What would you like to automate?
                </label>
                <textarea
                  {...register('naturalLanguageInput', {
                    required: 'Please describe your workflow',
                    minLength: {
                      value: 10,
                      message: 'Please provide more details (at least 10 characters)',
                    },
                  })}
                  rows={6}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                  placeholder=\"e.g., When I receive an email with an invoice, extract the vendor name, amount, and due date, then add it to my accounting spreadsheet and send me a Slack notification\"
                />
                {errors.naturalLanguageInput && (
                  <p className=\"mt-1 text-sm text-error-600\">{errors.naturalLanguageInput.message}</p>
                )}
                <p className=\"mt-2 text-sm text-gray-500\">
                  💡 Be specific about triggers, actions, and integrations you want to use
                </p>
              </div>

              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div>
                  <label htmlFor=\"name\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Workflow Name (Optional)
                  </label>
                  <input
                    {...register('name')}
                    type=\"text\"
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                    placeholder=\"e.g., Invoice Processing Automation\"
                  />
                  <p className=\"mt-1 text-sm text-gray-500\">AI will suggest a name if left blank</p>
                </div>
                
                <div>
                  <label htmlFor=\"description\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Description (Optional)
                  </label>
                  <input
                    {...register('description')}
                    type=\"text\"
                    className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500\"
                    placeholder=\"Brief description of the workflow\"
                  />
                </div>
              </div>

              <div className=\"flex justify-between\">
                <Button type=\"button\" variant=\"secondary\" onClick={handleBack}>
                  Cancel
                </Button>
                <Button 
                  type=\"submit\" 
                  leftIcon={<SparklesIcon className=\"w-4 h-4\" />}
                  disabled={!naturalLanguageInput || naturalLanguageInput.length < 10}
                >
                  Generate with AI
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {step === 'creating' && (
        <Card>
          <CardBody>
            <div className=\"text-center py-12\">
              <LoadingSpinner size=\"lg\" className=\"mx-auto mb-4\" />
              <h3 className=\"text-lg font-medium text-gray-900 mb-2\">Generating Your Workflow</h3>
              <p className=\"text-gray-600\">AI is analyzing your requirements and creating the perfect automation...</p>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 'preview' && generatedWorkflow && (
        <div className=\"space-y-6\">
          <Card>
            <CardHeader>
              <div className=\"flex items-center space-x-2\">
                <SparklesIcon className=\"h-5 w-5 text-primary-600\" />
                <h2 className=\"text-lg font-semibold text-gray-900\">AI Generated Workflow</h2>
              </div>
              <p className=\"text-sm text-gray-600\">Review the generated workflow and make any adjustments</p>
            </CardHeader>
            <CardBody>
              <div className=\"space-y-6\">
                {/* Workflow Details */}
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-700 mb-2\">Workflow Name</h3>
                    <p className=\"text-gray-900\">{generatedWorkflow.name}</p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-700 mb-2\">Description</h3>
                    <p className=\"text-gray-900\">{generatedWorkflow.description}</p>
                  </div>
                </div>

                {/* Estimated Benefits */}
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary-50 p-4 rounded-lg\">
                  <div className=\"text-center\">
                    <div className=\"text-2xl font-bold text-primary-600 mb-1\">
                      {generatedWorkflow.estimatedTimeSavings}h
                    </div>
                    <div className=\"text-sm text-gray-600\">Estimated Time Saved/Month</div>
                  </div>
                  <div className=\"text-center\">
                    <div className=\"text-2xl font-bold text-success-600 mb-1\">
                      ${generatedWorkflow.estimatedCostSavings}
                    </div>
                    <div className=\"text-sm text-gray-600\">Estimated Cost Saved/Month</div>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div>
                  <h3 className=\"text-sm font-medium text-gray-700 mb-4\">Workflow Steps</h3>
                  <div className=\"space-y-3\">
                    {generatedWorkflow.steps.map((step: any, index: number) => (
                      <div key={step.id} className=\"flex items-start space-x-3 p-3 bg-gray-50 rounded-lg\">
                        <div className=\"flex-shrink-0\">
                          <div className=\"w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium\">
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <div className=\"flex items-center space-x-2 mb-1\">
                            <h4 className=\"font-medium text-gray-900\">{step.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              step.type === 'trigger' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {step.type}
                            </span>
                          </div>
                          <p className=\"text-sm text-gray-600\">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Integrations */}
                <div>
                  <h3 className=\"text-sm font-medium text-gray-700 mb-3\">Required Integrations</h3>
                  <div className=\"flex flex-wrap gap-2\">
                    {generatedWorkflow.integrations.map((integration: string) => (
                      <span key={integration} className=\"px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm\">
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className=\"flex justify-between\">
            <Button variant=\"secondary\" onClick={handleBack}>
              Back to Edit
            </Button>
            <Button
              onClick={handleSubmit(onCreateWorkflow)}
              leftIcon={<BoltIcon className=\"w-4 h-4\" />}
              isLoading={createWorkflowMutation.isPending}
            >
              Create Workflow
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};", "original_text": "", "replace_all": false}]