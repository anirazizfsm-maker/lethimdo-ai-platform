import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Workflow } from '../../../shared/types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Workflow state
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  
  // UI state
  sidebarOpen: boolean;
  selectedPeriod: 'day' | 'week' | 'month' | 'year';
  darkMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;
  setActiveWorkflow: (workflow: Workflow | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      workflows: [],
      activeWorkflow: null,
      sidebarOpen: false,
      selectedPeriod: 'month',
      darkMode: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      addWorkflow: (workflow) => set((state) => ({ 
        workflows: [...state.workflows, workflow] 
      })),
      updateWorkflow: (id, updatedWorkflow) => set((state) => ({
        workflows: state.workflows.map(wf => 
          wf.id === id ? { ...wf, ...updatedWorkflow } : wf
        )
      })),
      removeWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter(wf => wf.id !== id)
      })),
      setActiveWorkflow: (workflow) => set({ activeWorkflow: workflow }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setDarkMode: (darkMode) => set({ darkMode }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'lethimdo-app-store',
      partialize: (state) => ({ 
        darkMode: state.darkMode,
        selectedPeriod: state.selectedPeriod,
        sidebarOpen: state.sidebarOpen
      }),
    }
  )
);