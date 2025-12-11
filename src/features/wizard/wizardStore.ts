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
  calculateResult: () => Promise<void>;
  canProceed: () => boolean;
  getTotalSteps: () => number;
  shouldSkipNormalityStep: () => boolean;
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
    const { currentStep, getTotalSteps, calculateResult, shouldSkipNormalityStep } = get();
    const totalSteps = getTotalSteps();
    const uiConfig = configService.getUIConfig();

    if (currentStep < totalSteps - 1) {
      let nextStepIndex = currentStep + 1;

      // If we should skip the normality step and we're about to land on it, skip it
      if (shouldSkipNormalityStep() && uiConfig) {
        const nextStepId = uiConfig.steps[nextStepIndex]?.id;
        if (nextStepId === 'normality') {
          // We've completed all steps (skipped normality), so calculate result
          calculateResult();
          return;
        }
      }

      set({ currentStep: nextStepIndex });
    } else {
      calculateResult();
    }
  },

  prevStep: () => {
    const { currentStep, shouldSkipNormalityStep } = get();
    const uiConfig = configService.getUIConfig();

    if (currentStep > 0) {
      let prevStepIndex = currentStep - 1;

      // If we should skip the normality step and we're about to land on it, skip it
      if (shouldSkipNormalityStep() && uiConfig) {
        const prevStepId = uiConfig.steps[prevStepIndex]?.id;
        if (prevStepId === 'normality' && prevStepIndex > 0) {
          prevStepIndex = prevStepIndex - 1;
        }
      }

      set({ currentStep: prevStepIndex, isComplete: false, result: null });
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

  calculateResult: async () => {
    const { selections } = get();
    
    // Force reload config to ensure we have the latest test details
    await configService.reload();
    
    const testsConfig = configService.getTestsConfig();
    const ruleResult = findMatchingTest(selections, testsConfig);
    
    if (ruleResult.test) {
      const testDetails = configService.getTestDetail(ruleResult.test.id);
      console.log('Test details for', ruleResult.test.id, ':', testDetails);
      
      const result: WizardResult = {
        test: ruleResult.test,
        rationale: ruleResult.rationale,
        selections: ruleResult.selections,
        details: testDetails
      };
      
      set({ result, isComplete: true });
    } else {
      // Handle error case
      const result: WizardResult = {
        test: { id: 'error', name: 'No Test Found' },
        rationale: ruleResult.rationale,
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
    const { shouldSkipNormalityStep } = get();
    const totalSteps = uiConfig?.steps.length || 3;

    // If we're skipping the normality step, reduce total by 1
    return shouldSkipNormalityStep() ? totalSteps - 1 : totalSteps;
  },

  shouldSkipNormalityStep: () => {
    const { selections } = get();
    // Skip normality step if user selected to test normality (measure === "normality")
    return selections.measure === 'normality';
  },
}));