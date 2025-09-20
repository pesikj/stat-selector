import { WizardSelections, Rule, Test, TestsConfig } from './types';

export interface RuleResult {
  test?: Test;
  rationale: string;
  error?: boolean;
  selections: WizardSelections;
}

export function findMatchingTest(
  selections: WizardSelections,
  testsConfig: TestsConfig | null
): RuleResult {
  if (!testsConfig) {
    return {
      rationale: "Configuration not loaded",
      error: true,
      selections,
    };
  }

  // Find the most specific matching rule
  let bestMatch: Rule | null = null;
  let maxMatches = -1;

  for (const rule of testsConfig.rules) {
    const matches = countMatches(selections, rule.when);
    if (matches > maxMatches && matches > 0) {
      // Check if all conditions in the rule are satisfied
      const allConditionsMet = Object.entries(rule.when).every(([key, value]) => {
        const selectionValue = selections[key as keyof WizardSelections];
        return selectionValue === value;
      });

      if (allConditionsMet) {
        bestMatch = rule;
        maxMatches = matches;
      }
    }
  }

  if (bestMatch) {
    return {
      test: bestMatch.test,
      rationale: generateRationale(selections, bestMatch.test),
      selections,
    };
  }

  return {
    rationale: `No matching test found for: ${formatSelections(selections)}`,
    error: true,
    selections,
  };
}

function countMatches(selections: WizardSelections, conditions: Record<string, string>): number {
  let matches = 0;
  for (const [key, value] of Object.entries(conditions)) {
    const selectionValue = selections[key as keyof WizardSelections];
    if (selectionValue === value) {
      matches++;
    } else if (selectionValue === undefined) {
      // If selection is missing but rule requires it, this rule doesn't match
      return 0;
    } else {
      // If selection doesn't match, this rule doesn't match
      return 0;
    }
  }
  return matches;
}

function generateRationale(selections: WizardSelections, test: Test): string {
  const parts: string[] = [];
  
  if (selections.samples) {
    const sampleText = selections.samples === 'three_or_more' ? 'three or more samples' : `${selections.samples} sample${selections.samples === 'two' ? 's' : ''}`;
    parts.push(`${sampleText}`);
  }
  
  if (selections.measure) {
    parts.push(`comparing ${selections.measure}`);
  }
  
  if (selections.normality) {
    const normalityText = selections.normality === 'yes' ? 'normally distributed data' : 
                         selections.normality === 'no' ? 'non-normally distributed data' : 
                         'uncertain distribution';
    parts.push(`with ${normalityText}`);
  }

  const rationale = `Recommended because you have ${parts.join(', ')}.`;
  
  if (test.alt) {
    return `${rationale} Alternative: ${test.alt}.`;
  }
  
  return rationale;
}

function formatSelections(selections: WizardSelections): string {
  const parts: string[] = [];
  
  if (selections.samples) parts.push(`samples: ${selections.samples}`);
  if (selections.measure) parts.push(`measure: ${selections.measure}`);
  if (selections.normality) parts.push(`normality: ${selections.normality}`);
  
  return parts.join(', ') || 'no selections';
}