export interface ApplicationConfig {
  name: string;
  version: string;
  description: string;
  baseUrl: string;
  defaultCredentials?: {
    username: string;
    password: string;
  };
  elements: {
    [moduleName: string]: {
      [elementName: string]: string;
    };
  };
  testContext: string;
  environment: {
    timeout: number;
    retries: number;
    browsers: string[];
    headless: boolean;
  };
}

export interface ExecutorConfig {
  application: string;
  dataSource?: {
    type: 'external' | 'inline';
    path?: string;
  };
  browser?: string;
  headless?: boolean;
  timeout?: number;
  retries?: number;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configs: Map<string, ApplicationConfig> = new Map();

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadConfig(appName: string): Promise<ApplicationConfig> {
    if (this.configs.has(appName)) {
      return this.configs.get(appName)!;
    }

    try {
      const configPath = `./config/app-configs/${appName.toLowerCase()}.json`;
      const fs = await import('fs/promises');
      const configData = await fs.readFile(configPath, 'utf-8');
      const config: ApplicationConfig = JSON.parse(configData);
      
      this.configs.set(appName, config);
      return config;
    } catch (error) {
      throw new Error(`Failed to load configuration for application '${appName}': ${error}`);
    }
  }

  getAvailableConfigs(): string[] {
    const fs = require('fs');
    const path = require('path');
    const configDir = './config/app-configs';
    
    try {
      const files = fs.readdirSync(configDir);
      return files
        .filter((file: string) => file.endsWith('.json'))
        .map((file: string) => path.basename(file, '.json'));
    } catch (error) {
      return [];
    }
  }

  validateConfig(config: ApplicationConfig): boolean {
    const required = ['name', 'baseUrl', 'elements', 'testContext', 'environment'];
    return required.every(field => config.hasOwnProperty(field));
  }
}
