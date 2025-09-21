import { UIConfig, TestsConfig, TestDetailsConfig, UIConfigSchema, TestsConfigSchema, TestDetailsConfigSchema } from './types';

class ConfigService {
  private uiConfig: UIConfig | null = null;
  private testsConfig: TestsConfig | null = null;
  private testDetails: TestDetailsConfig | null = null;
  private assumptions: Record<string, string> = {};
  private listeners: Array<() => void> = [];

  async loadConfigs(): Promise<void> {
    try {
      // Load UI config
      const uiResponse = await fetch('/config/ui.json');
      const uiData = await uiResponse.json();
      this.uiConfig = UIConfigSchema.parse(uiData);

      // Load tests config
      const testsResponse = await fetch('/config/tests.json');
      const testsData = await testsResponse.json();
      this.testsConfig = TestsConfigSchema.parse(testsData);

      // Load test details
      const testDetailsResponse = await fetch('/config/test-details.json');
      const testDetailsData = await testDetailsResponse.json();
      this.testDetails = TestDetailsConfigSchema.parse(testDetailsData);

      // Load assumptions markdown
      const assumptionsResponse = await fetch('/config/assumptions.md');
      const assumptionsText = await assumptionsResponse.text();
      this.assumptions = this.parseAssumptions(assumptionsText);

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load configs:', error);
      throw error;
    }
  }

  private parseAssumptions(markdown: string): Record<string, string> {
    const assumptions: Record<string, string> = {};
    const sections = markdown.split(/^### /m).filter(Boolean);
    
    for (const section of sections) {
      const lines = section.split('\n');
      const id = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      assumptions[id] = content;
    }
    
    return assumptions;
  }

  getUIConfig(): UIConfig | null {
    return this.uiConfig;
  }

  getTestsConfig(): TestsConfig | null {
    return this.testsConfig;
  }

  getAssumptions(): Record<string, string> {
    return this.assumptions;
  }

  getAssumption(testId: string): string {
    return this.assumptions[testId] || 'No assumptions available for this test.';
  }

  getTestDetails(): TestDetailsConfig | null {
    return this.testDetails;
  }

  getTestDetail(testId: string) {
    return this.testDetails?.[testId] || null;
  }

  async reload(): Promise<void> {
    await this.loadConfigs();
  }

  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  // Config validation and updating methods
  async updateUIConfig(config: UIConfig): Promise<void> {
    try {
      const validated = UIConfigSchema.parse(config);
      this.uiConfig = validated;
      this.notifyListeners();
    } catch (error) {
      throw new Error(`Invalid UI config: ${error}`);
    }
  }

  async updateTestsConfig(config: TestsConfig): Promise<void> {
    try {
      const validated = TestsConfigSchema.parse(config);
      this.testsConfig = validated;
      this.notifyListeners();
    } catch (error) {
      throw new Error(`Invalid tests config: ${error}`);
    }
  }
}

export const configService = new ConfigService();