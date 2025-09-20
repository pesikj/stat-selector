import { create } from 'zustand';
import { WizardSelections, WizardResult } from '../../lib/types';
import { findMatchingTest } from '../../lib/rulesEngine';
import { configService } from '../../lib/configService';

interface WizardState {
  currentStep: number;
  selections: WizardSelections;
  result: WizardResult | null;
  isComplete: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setSelection: (key: keyof WizardSelections, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  calculateResult: () => void;
  canProceed: () => boolean;
  getTotalSteps: () => number;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: 0,
  selections: {},
  result: null,
  isComplete: false,

  setStep: (step: number) => {
    set({ currentStep: step, isComplete: false });
  },

  setSelection: (key: keyof WizardSelections, value: string) => {
    const { selections, currentStep } = get();
    const newSelections = { ...selections, [key]: value };
    
    // If changing samples selection, clear measure
    if (key === 'samples' && selections.samples !== value) {
      delete newSelections.measure;
    }
    
    set({ 
      selections: newSelections,
      result: null,
      isComplete: false
    });
  },

  nextStep: () => {
    const { currentStep, getTotalSteps, calculateResult } = get();
    const totalSteps = getTotalSteps();
    
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      calculateResult();
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1, isComplete: false, result: null });
    }
  },

  reset: () => {
    set({
      currentStep: 0,
      selections: {},
      result: null,
      isComplete: false,
    });
  },

  calculateResult: () => {
    const { selections } = get();
    const testsConfig = configService.getTestsConfig();
    const ruleResult = findMatchingTest(selections, testsConfig);
    
    if (ruleResult.test) {
      const assumptions = configService.getAssumption(ruleResult.test.id);
      
      const result: WizardResult = {
        test: ruleResult.test,
        rationale: ruleResult.rationale,
        assumptions,
        selections: ruleResult.selections,
      };
      
      set({ result, isComplete: true });
    } else {
      // Handle error case
      const result: WizardResult = {
        test: { id: 'error', name: 'No Test Found' },
        rationale: ruleResult.rationale,
        assumptions: 'Please check your selections and try again.',
        selections: ruleResult.selections,
      };
      
      set({ result, isComplete: true });
    }
  },

  canProceed: () => {
    const { currentStep, selections } = get();
    const uiConfig = configService.getUIConfig();
    
    if (!uiConfig) return false;
    
    const steps = uiConfig.steps;
    if (currentStep >= steps.length) return true;
    
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'samples':
        return !!selections.samples;
      case 'measure':
        return !!selections.measure;
      case 'normality':
        return !!selections.normality;
      default:
        return true;
    }
  },

  getTotalSteps: () => {
    const uiConfig = configService.getUIConfig();
    return uiConfig?.steps.length || 3;
  },
}));