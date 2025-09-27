import { z } from "zod";

export type Samples = "one" | "two" | "three_or_more";
export type Normality = "yes" | "no" | "unsure";

// Option schema for UI configuration
export const OptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

// Step schema for UI configuration
export const StepSchema = z.object({
  id: z.string(),
  label: z.string(),
  options: z.array(OptionSchema).optional(),
  optionsBySamples: z.record(z.array(OptionSchema)).optional(),
});

// UI configuration schema
export const UIConfigSchema = z.object({
  title: z.string(),
  steps: z.array(StepSchema),
});

// Test result schema
export const TestSchema = z.object({
  id: z.string(),
  name: z.string(),
  alt: z.string().optional(),
});

// Rule schema for test mapping
export const RuleSchema = z.object({
  when: z.record(z.string()),
  test: TestSchema,
});

// Alternative option schema
export const AlternativeOptionSchema = z.object({
  symbol: z.string(),
  label: z.string(),
  nullHypothesis: z.string(),
  alternativeHypothesis: z.string(),
  pythonCode: z.string(),
});

// Test details schema
export const TestDetailsSchema = z.object({
  description: z.string(),
  nullHypothesis: z.string(),
  alternativeHypothesis: z.string(),
  pythonCode: z.string(),
  examples: z.array(z.string()).optional(),
  specificExamples: z.object({
    nullHypothesis: z.string(),
    alternativeHypothesis: z.string(),
  }).optional(),
  alternatives: z.array(AlternativeOptionSchema).optional(),
});

// Tests configuration schema
export const TestsConfigSchema = z.object({
  rules: z.array(RuleSchema),
});

// Test details collection schema
export const TestDetailsConfigSchema = z.record(TestDetailsSchema);

// Inferred types
export type Option = z.infer<typeof OptionSchema>;
export type Step = z.infer<typeof StepSchema>;
export type UIConfig = z.infer<typeof UIConfigSchema>;
export type Test = z.infer<typeof TestSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type TestsConfig = z.infer<typeof TestsConfigSchema>;
export type AlternativeOption = z.infer<typeof AlternativeOptionSchema>;
export type TestDetails = z.infer<typeof TestDetailsSchema>;
export type TestDetailsConfig = z.infer<typeof TestDetailsConfigSchema>;

// Wizard state
export interface WizardSelections {
  samples?: Samples;
  measure?: string;
  normality?: Normality;
}

export interface WizardResult {
  test: Test;
  rationale: string;
  selections: WizardSelections;
  details?: TestDetails;
}

export interface ConfigState {
  ui: UIConfig | null;
  tests: TestsConfig | null;
  testDetails: TestDetailsConfig | null;
  isLoading: boolean;
  error: string | null;
}