import { create } from 'zustand';
import { ConfigState, UIConfig, TestsConfig } from '../../lib/types';
import { configService } from '../../lib/configService';

interface ConfigStoreState extends ConfigState {
  // Actions
  loadConfig: () => Promise<void>;
  updateUIConfig: (config: UIConfig) => Promise<void>;
  updateTestsConfig: (config: TestsConfig) => Promise<void>;
  reloadConfig: () => Promise<void>;
  clearError: () => void;
}

export const useConfigStore = create<ConfigStoreState>((set, get) => ({
  ui: null,
  tests: null,
  assumptions: {},
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await configService.loadConfigs();
      
      set({
        ui: configService.getUIConfig(),
        tests: configService.getTestsConfig(),
        assumptions: configService.getAssumptions(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load configuration',
        isLoading: false,
      });
    }
  },

  updateUIConfig: async (config: UIConfig) => {
    try {
      await configService.updateUIConfig(config);
      set({ ui: config, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update UI configuration',
      });
      throw error;
    }
  },

  updateTestsConfig: async (config: TestsConfig) => {
    try {
      await configService.updateTestsConfig(config);
      set({ tests: config, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update tests configuration',
      });
      throw error;
    }
  },

  reloadConfig: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await configService.reload();
      
      set({
        ui: configService.getUIConfig(),
        tests: configService.getTestsConfig(),
        assumptions: configService.getAssumptions(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reload configuration',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));