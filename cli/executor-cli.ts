#!/usr/bin/env node

/**
 * 🚀 Enhanced MCP Executor CLI
 * 
 * Configuration-driven test execution with multi-application support
 * 
 * Usage Examples:
 *   npx ts-node cli/executor-cli.ts --app=orangehrm --file=verifyPIMPage.txt
 *   npx ts-node cli/executor-cli.ts --app=shopify --suite=smoke --browsers=chromium,firefox
 *   npx ts-node cli/executor-cli.ts --list-apps
 *   npx ts-node cli/executor-cli.ts --app=genericweb --file=Login_Test.txt --headed
 */

import { ConfigManager } from '../config/config-manager';

// Import the executor class - need to define interface for it
interface ExecutorOptions {
  app?: string;
  file?: string;
  suite?: string;
  browsers?: string[];
  headed?: boolean;
  parallel?: boolean;
  verbose?: boolean;
}

// We'll import the executor dynamically to avoid circular dependencies

interface CLIOptions {
  app?: string;
  file?: string;
  suite?: string;
  browsers?: string[];
  headed?: boolean;
  parallel?: boolean;
  verbose?: boolean;
  listApps?: boolean;
  help?: boolean;
}

class ExecutorCLI {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  private showHelp(): void {
    console.log(`
🚀 Enhanced MCP Executor CLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USAGE:
  npx ts-node cli/executor-cli.ts [OPTIONS]

APPLICATION CONFIG:
  --app=<name>          Application configuration to use (default: orangehrm)
  --list-apps           List all available application configurations

TEST SELECTION:
  --file=<filename>     Execute specific test file
  --suite=<name>        Execute test suite (smoke, regression, etc.)

BROWSER OPTIONS:
  --browsers=<list>     Comma-separated browser list (chromium,firefox,webkit)
  --headed              Run with visible browser (default: headless)
  --parallel            Run browsers in parallel

OUTPUT:
  --verbose             Detailed execution logs
  --help                Show this help message

EXAMPLES:
  # OrangeHRM testing
  npx ts-node cli/executor-cli.ts --app=orangehrm --file=verifyPIMPage.txt --headed
  
  # Multi-app e-commerce testing
  npx ts-node cli/executor-cli.ts --app=shopify --suite=smoke --browsers=chromium,firefox
  
  # Generic web app testing
  npx ts-node cli/executor-cli.ts --app=genericweb --file=Login_Test.txt
  
  # List available configurations
  npx ts-node cli/executor-cli.ts --list-apps

AVAILABLE APPLICATIONS:
`);

    const apps = this.configManager.getAvailableConfigs();
    apps.forEach(app => console.log(`  • ${app}`));
    
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  }

  private listApplications(): void {
    console.log('📋 Available Application Configurations:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const apps = this.configManager.getAvailableConfigs();
    
    if (apps.length === 0) {
      console.log('❌ No application configurations found');
      console.log('💡 Create config files in config/app-configs/ directory');
      return;
    }

    apps.forEach(async (app, index) => {
      try {
        const config = await this.configManager.loadConfig(app);
        console.log(`${index + 1}. ${app}`);
        console.log(`   Name: ${config.name}`);
        console.log(`   URL: ${config.baseUrl}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Browsers: ${config.environment.browsers.join(', ')}`);
        console.log('');
      } catch (error) {
        console.log(`${index + 1}. ${app} (❌ Invalid config)`);
      }
    });
  }

  private parseArguments(): CLIOptions {
    const args = process.argv.slice(2);
    const options: CLIOptions = {};

    for (const arg of args) {
      if (arg.startsWith('--app=')) {
        options.app = arg.split('=')[1];
      } else if (arg.startsWith('--file=')) {
        options.file = arg.split('=')[1];
      } else if (arg.startsWith('--suite=')) {
        options.suite = arg.split('=')[1];
      } else if (arg.startsWith('--browsers=')) {
        options.browsers = arg.split('=')[1].split(',');
      } else if (arg === '--headed') {
        options.headed = true;
      } else if (arg === '--parallel') {
        options.parallel = true;
      } else if (arg === '--verbose') {
        options.verbose = true;
      } else if (arg === '--list-apps') {
        options.listApps = true;
      } else if (arg === '--help') {
        options.help = true;
      }
    }

    return options;
  }

  async run(): Promise<void> {
    console.log('🚀 Enhanced MCP Executor CLI');
    
    const options = this.parseArguments();

    if (options.help) {
      this.showHelp();
      return;
    }

    if (options.listApps) {
      this.listApplications();
      return;
    }

    // Default to orangehrm if no app specified
    const appName = options.app || 'orangehrm';
    
    console.log(`📱 Application: ${appName}`);
    console.log(`🔧 Configuration: ${options.file ? 'Single file' : options.suite ? 'Suite' : 'All tests'}`);
    
    try {
      // Dynamic import to avoid circular dependencies
      const { RealMCPExecutor } = await import('../agents/executor');
      const executor = new RealMCPExecutor();
      
      await executor.execute({
        app: appName,
        file: options.file,
        suite: options.suite,
        browsers: options.browsers,
        headed: options.headed,
        parallel: options.parallel,
        verbose: options.verbose
      });
      
      console.log('✅ Execution completed successfully');
    } catch (error) {
      console.error('❌ Execution failed:', error);
      process.exit(1);
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ExecutorCLI();
  cli.run().catch(console.error);
}

export { ExecutorCLI };
