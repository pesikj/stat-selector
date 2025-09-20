import { describe, it, expect } from 'vitest';
import { findMatchingTest } from '../rulesEngine';
import { TestsConfig, WizardSelections } from '../types';

const mockTestsConfig: TestsConfig = {
  rules: [
    { 
      when: { samples: "two", measure: "means", normality: "no" }, 
      test: { id: "mann_whitney_u", name: "Mann–Whitney U" } 
    },
    { 
      when: { samples: "two", measure: "means", normality: "yes" }, 
      test: { id: "welch_t", name: "Welch's t-test" } 
    },
    { 
      when: { samples: "one", measure: "mean" }, 
      test: { id: "one_sample_t", name: "One-sample t-test", alt: "Wilcoxon signed-rank" } 
    },
  ],
};

describe('rulesEngine', () => {
  it('should find exact match for two samples, means, non-normal', () => {
    const selections: WizardSelections = {
      samples: 'two',
      measure: 'means',
      normality: 'no',
    };

    const result = findMatchingTest(selections, mockTestsConfig);

    expect(result.test).toBeDefined();
    expect(result.test?.name).toBe('Mann–Whitney U');
    expect(result.error).toBeUndefined();
    expect(result.rationale).toContain('two samples');
    expect(result.rationale).toContain('comparing means');
    expect(result.rationale).toContain('non-normally distributed');
  });

  it('should prefer more specific rules', () => {
    const selections: WizardSelections = {
      samples: 'two',
      measure: 'means',
      normality: 'yes',
    };

    const result = findMatchingTest(selections, mockTestsConfig);

    expect(result.test?.name).toBe("Welch's t-test");
  });

  it('should handle wildcard matches', () => {
    const selections: WizardSelections = {
      samples: 'one',
      measure: 'mean',
      normality: 'yes',
    };

    const result = findMatchingTest(selections, mockTestsConfig);

    expect(result.test?.name).toBe('One-sample t-test');
    expect(result.test?.alt).toBe('Wilcoxon signed-rank');
  });

  it('should return error for no matching rules', () => {
    const selections: WizardSelections = {
      samples: 'three_or_more',
      measure: 'correlation',
      normality: 'yes',
    };

    const result = findMatchingTest(selections, mockTestsConfig);

    expect(result.test).toBeUndefined();
    expect(result.error).toBe(true);
    expect(result.rationale).toContain('No matching test found');
  });

  it('should handle null config gracefully', () => {
    const selections: WizardSelections = {
      samples: 'two',
      measure: 'means',
      normality: 'no',
    };

    const result = findMatchingTest(selections, null);

    expect(result.error).toBe(true);
    expect(result.rationale).toBe('Configuration not loaded');
  });
});