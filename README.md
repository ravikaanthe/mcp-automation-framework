# MCP Automation Framework

[![Build Status](https://dev.azure.com/your-org/your-project/_apis/build/status/mcp-automation-framework?branchName=main)](https://dev.azure.com/your-org/your-project/_build/latest?definitionId=your-definition-id&branchName=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AI-driven test automation framework using natural language prompts with Playwright MCP**

## � **Overview**

A **configuration-driven AI automation framework** that executes browser tests using natural language prompts via Playwright MCP. Designed for enterprise scalability with support for unlimited applications through JSON configuration.

## ✨ **Key Features**

✅ **Configuration-Driven** - No code changes for new applications  
✅ **Natural Language Testing** - Write tests in plain English  
✅ **Multi-Browser Support** - Chromium, Firefox, WebKit  
✅ **Enterprise Ready** - Scalable across organizations  
✅ **CI/CD Optimized** - Azure DevOps, GitHub Actions ready  
✅ **Zero Maintenance** - Pure configuration approach  

## 🏗️ **Architecture**

```
📁 Framework/
├── 📁 agents/                    # Core execution engine
├── 📁 config/                    # Configuration management
│   └── 📁 app-configs/           # Application JSON configs
├── 📁 cli/                       # Enhanced CLI interface
├── 📁 prompts/                   # Natural language test files
└── 📁 docs/                      # Complete documentation
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- VS Code (for MCP support)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/your-org/mcp-automation-framework.git
cd mcp-automation-framework

# Install dependencies
npm install
npx playwright install

# Run your first test
npm run ci:buzz
```

### **Running Tests**
```bash
# NPM Scripts (Recommended)
npm run ci:smoke          # Smoke tests
npm run ci:regression     # Full regression
npm run ci:pim            # PIM module tests
npm run ci:login          # Login tests

# Enhanced CLI
ts-node cli/executor-cli.ts --app=orangehrm --file=Login_Datadriven.txt

# Direct Executor
ts-node agents/executor.ts --app=orangehrm --file=VerifyBuzzPostVerification.txt --browsers=chromium,firefox
```

## 📊 **Supported Applications**

| Application | Config File | Status | Tests |
|-------------|-------------|--------|-------|
| **OrangeHRM** | `orangehrm.json` | ✅ Production | 8 test files |
| **Generic Web** | `genericweb.json` | ✅ Template | Configurable |
| **Shopify** | `shopify.json` | ✅ E-commerce | Template |

## 🎯 **Adding New Applications**

1. **Create configuration**: `config/app-configs/your-app.json`
2. **Write test prompts**: Natural language files in `prompts/`
3. **Execute tests**: `--app=your-app`

**No code changes required!**

## 📚 **Documentation**

- **[📖 Complete Guide](docs/README.md)** - Framework overview and setup
- **[⚡ Quick Reference](docs/QUICK_REFERENCE.md)** - Commands and workflows  
- **[✍️ Writing Tests](docs/PROMPTING_STANDARDS.md)** - Prompt guidelines
- **[🌐 Multi-Browser](docs/Multi-Browser-Testing.md)** - Cross-browser testing
- **[🚀 Implementation](docs/Framework-Implementation-Guide.md)** - Adoption guide

## 🔧 **CI/CD Integration**

### **Azure DevOps**
```yaml
# See azure-pipelines.yml for complete configuration
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
- script: npm ci && npx playwright install
- script: npm run ci:regression
```

### **GitHub Actions**
```yaml
# See .github/workflows/ci.yml for complete configuration
- uses: actions/setup-node@v3
  with:
    node-version: '18'
- run: npm ci && npx playwright install
- run: npm run ci:smoke
```

## 📈 **Test Results**

The framework generates comprehensive test reports in multiple formats:
- **HTML Reports** - `results/html-report/index.html`
- **JSON Reports** - `results/test-results.json`
- **JUnit XML** - `results/junit-results.xml`

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow [prompting standards](docs/PROMPTING_STANDARDS.md)
4. Submit pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/mcp-automation-framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/mcp-automation-framework/discussions)

## 🌟 **Enterprise Usage**

This framework is designed for enterprise adoption with support for:
- **Unlimited applications** via JSON configuration
- **Team independence** with configuration ownership
- **Scalable architecture** across organizations
- **Professional CI/CD integration**

---

**Ready to transform your test automation? Start with our [Implementation Guide](docs/Framework-Implementation-Guide.md)!** 🚀
