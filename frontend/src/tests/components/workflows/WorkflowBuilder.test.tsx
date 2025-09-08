import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowBuilder } from '../../../pages/workflows/WorkflowBuilder';
import { BrowserRouter } from 'react-router-dom';
import { workflowApi, aiApi } from '../../../services/api';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('react-hot-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockWorkflowApi = workflowApi as jest.Mocked<typeof workflowApi>;
const mockAiApi = aiApi as jest.Mocked<typeof aiApi>;

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('WorkflowBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workflow builder form correctly', () => {
    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
    expect(screen.getByText('Describe Your Workflow')).toBeInTheDocument();
    expect(screen.getByLabelText('What would you like to automate?')).toBeInTheDocument();
    expect(screen.getByLabelText('Workflow Name (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate with ai/i })).toBeInTheDocument();
  });

  it('shows validation error for empty description', async () => {
    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const generateButton = screen.getByRole('button', { name: /generate with ai/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Please describe your workflow')).toBeInTheDocument();
    });
  });

  it('shows validation error for short description', async () => {
    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { target: { value: 'short' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Please provide more details (at least 10 characters)')).toBeInTheDocument();
    });
  });

  it('disables generate button when description is too short', () => {
    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { target: { value: 'short' } });
    
    expect(generateButton).toBeDisabled();
  });

  it('enables generate button when description is valid', () => {
    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { 
      target: { value: 'Automate email processing and data extraction from invoices' } 
    });
    
    expect(generateButton).not.toBeDisabled();
  });

  it('shows progress steps correctly', () => {
    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    // Should show step 1 as active
    expect(screen.getByText('Describe Workflow')).toBeInTheDocument();
    expect(screen.getByText('AI Generation')).toBeInTheDocument();
    expect(screen.getByText('Review & Create')).toBeInTheDocument();
  });

  it('transitions to generating state when form is submitted', async () => {
    // Mock successful AI generation
    const mockWorkflowData = {
      success: true,
      data: {
        name: 'Generated Workflow',
        description: 'AI generated workflow',
        estimatedTimeSavings: 30,
        estimatedCostSavings: 150,
        steps: [
          { id: 1, type: 'trigger', name: 'Email Trigger', description: 'Trigger on email' },
          { id: 2, type: 'action', name: 'Process Data', description: 'Process email data' },
        ],
        integrations: ['Gmail', 'Sheets'],
      },
    };

    // Mock API to return after a delay
    mockAiApi.generateWorkflow.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockWorkflowData), 100))
    );

    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { 
      target: { value: 'Automate invoice processing from email attachments' } 
    });
    fireEvent.click(generateButton);

    // Should show generating state
    await waitFor(() => {
      expect(screen.getByText('Generating Your Workflow')).toBeInTheDocument();
      expect(screen.getByText('AI is analyzing your requirements and creating the perfect automation...')).toBeInTheDocument();
    });
  });

  it('shows preview after successful generation', async () => {
    const mockWorkflowData = {
      success: true,
      data: {
        name: 'Invoice Processing Automation',
        description: 'Automated invoice processing workflow',
        estimatedTimeSavings: 45,
        estimatedCostSavings: 250,
        steps: [
          { id: 1, type: 'trigger', name: 'Email Received', description: 'When invoice email is received' },
          { id: 2, type: 'action', name: 'Extract Data', description: 'Extract invoice data using OCR' },
          { id: 3, type: 'action', name: 'Update Spreadsheet', description: 'Add data to accounting sheet' },
        ],
        integrations: ['Gmail', 'Google Sheets'],
      },
    };

    mockAiApi.generateWorkflow.mockResolvedValue(mockWorkflowData);

    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { 
      target: { value: 'Process invoices from email automatically' } 
    });
    fireEvent.click(generateButton);

    // Wait for generation to complete and preview to show
    await waitFor(() => {
      expect(screen.getByText('AI Generated Workflow')).toBeInTheDocument();
      expect(screen.getByText('Invoice Processing Automation')).toBeInTheDocument();
      expect(screen.getByText('45h')).toBeInTheDocument(); // Time savings
      expect(screen.getByText('$250')).toBeInTheDocument(); // Cost savings
    });

    // Check workflow steps
    expect(screen.getByText('Email Received')).toBeInTheDocument();
    expect(screen.getByText('Extract Data')).toBeInTheDocument();
    expect(screen.getByText('Update Spreadsheet')).toBeInTheDocument();

    // Check integrations
    expect(screen.getByText('Gmail')).toBeInTheDocument();
    expect(screen.getByText('Google Sheets')).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByRole('button', { name: /back to edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create workflow/i })).toBeInTheDocument();
  });

  it('handles generation error correctly', async () => {
    mockAiApi.generateWorkflow.mockRejectedValue(new Error('AI service unavailable'));

    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { 
      target: { value: 'Process customer feedback emails' } 
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate workflow. Please try again.');
    });
  });

  it('allows going back from preview to edit', async () => {
    const mockWorkflowData = {
      success: true,
      data: {
        name: 'Test Workflow',
        description: 'Test workflow description',
        estimatedTimeSavings: 20,
        estimatedCostSavings: 100,
        steps: [],
        integrations: [],
      },
    };

    mockAiApi.generateWorkflow.mockResolvedValue(mockWorkflowData);

    render(
      <TestWrapper>
        <WorkflowBuilder />
      </TestWrapper>
    );

    const descriptionInput = screen.getByLabelText('What would you like to automate?');
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });

    fireEvent.change(descriptionInput, { 
      target: { value: 'Test workflow description for automation' } 
    });
    fireEvent.click(generateButton);

    // Wait for preview
    await waitFor(() => {
      expect(screen.getByText('AI Generated Workflow')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByRole('button', { name: /back to edit/i });
    fireEvent.click(backButton);

    // Should be back to form
    await waitFor(() => {
      expect(screen.getByText('Describe Your Workflow')).toBeInTheDocument();
      expect(screen.getByLabelText('What would you like to automate?')).toBeInTheDocument();
    });
  });
});", "original_text": "", "replace_all": false}