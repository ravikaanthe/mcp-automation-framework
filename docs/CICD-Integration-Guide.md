# 🚀 CI/CD Integration Guide

## 📋 **Overview**

This guide explains how to integrate the MCP Automation Framework with CI/CD pipelines, specifically Azure DevOps and GitHub Actions.

---

## 🔧 **Azure DevOps Integration**

### **Prerequisites**
- Azure DevOps organization and project
- Service connections configured (if needed)
- Agent pools available with Ubuntu/Windows agents

### **Pipeline Configuration**

The framework includes a complete `azure-pipelines.yml` file with:

#### **Pipeline Stages:**
1. **Setup & Validation** - Dependencies and framework validation
2. **Smoke Tests** - Quick validation tests
3. **Regression Tests** - Cross-browser test execution
4. **Full Regression** - Complete test suite (main branch only)
5. **Quality Gates** - Quality analysis and reporting

#### **Key Features:**
```yaml
# Optimized caching
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'

# Multi-browser strategy
strategy:
  matrix:
    Login_Tests:
      testSuite: 'ci:login'
    PIM_Tests:
      testSuite: 'ci:pim'
```

### **Setting Up Azure DevOps Pipeline**

1. **Create Pipeline:**
   ```bash
   # In Azure DevOps
   Pipelines → New Pipeline → GitHub → Select Repository → Existing Azure Pipelines YAML file
   ```

2. **Configure Variables:**
   ```yaml
   variables:
     nodeVersion: '18.x'
     displayName: 'MCP Automation Tests'
   ```

3. **Set Branch Policies:**
   - Require pipeline success for PR completion
   - Enable automatic triggering on main/develop branches

### **Azure DevOps Commands**
```bash
# Trigger pipeline manually
az pipelines run --name "MCP-Automation-Framework"

# Check pipeline status
az pipelines show --name "MCP-Automation-Framework"
```

---

## 🐙 **GitHub Actions Integration**

### **Workflow Configuration**

The framework includes `.github/workflows/ci.yml` with:

#### **Workflow Jobs:**
1. **setup-and-validate** - Setup and configuration validation
2. **smoke-tests** - Core functionality tests
3. **cross-browser-tests** - Multi-browser execution with matrix strategy
4. **full-regression** - Complete test suite
5. **quality-gates** - Quality analysis and reporting
6. **notification** - Results notification

#### **Key Features:**
```yaml
# Efficient caching
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'

# Matrix strategy for parallel execution
strategy:
  matrix:
    test-suite:
      - { name: "Login Tests", command: "ci:login" }
      - { name: "PIM Tests", command: "ci:pim" }
```

### **Setting Up GitHub Actions**

1. **Enable Actions:**
   ```bash
   # Repository Settings → Actions → Allow all actions
   ```

2. **Configure Secrets (if needed):**
   ```bash
   # Repository → Settings → Secrets and Variables → Actions
   # Add any required secrets for your applications
   ```

3. **Branch Protection Rules:**
   ```bash
   # Settings → Branches → Add rule
   # Require status checks to pass before merging
   # Require "MCP Automation Framework CI" to pass
   ```

### **GitHub CLI Commands**
```bash
# Check workflow status
gh workflow list

# View workflow runs
gh run list --workflow=ci.yml

# Trigger workflow manually
gh workflow run ci.yml
```

---

## 📊 **Test Results and Reporting**

### **Azure DevOps Results**
- **Test Results**: Automatically published as JUnit XML
- **HTML Reports**: Published as build artifacts
- **Coverage Reports**: Available in pipeline results
- **Artifacts**: Test results retained for 30 days

### **GitHub Actions Results**
- **Test Reporter**: Uses `dorny/test-reporter@v1` for JUnit results
- **Artifacts**: Uploaded with configurable retention
- **GitHub Pages**: HTML reports deployed automatically
- **PR Comments**: Automated result notifications

### **Report Formats Generated**
```
results/
├── html-report/           # Interactive HTML report
├── junit-results.xml      # JUnit format for CI tools
├── test-results.json      # JSON format for custom processing
└── screenshots/           # Failure screenshots (if any)
```

---

## 🎯 **Pipeline Optimization Tips**

### **Performance Optimization**
1. **Caching Strategy:**
   ```yaml
   # Azure DevOps
   - task: Cache@2
     inputs:
       key: 'npm | "$(Agent.OS)" | package-lock.json'
   
   # GitHub Actions  
   - uses: actions/setup-node@v3
     with:
       cache: 'npm'
   ```

2. **Parallel Execution:**
   ```bash
   # Enable parallel browser testing
   npm run ci:regression  # Runs tests in parallel across browsers
   ```

3. **Conditional Execution:**
   ```yaml
   # Run full regression only on main branch
   condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
   ```

### **Resource Management**
```yaml
# Set appropriate timeouts
timeoutInMinutes: 60

# Fail fast strategy for quick feedback
strategy:
  fail-fast: false
```

---

## 🔍 **Monitoring and Alerts**

### **Azure DevOps Monitoring**
```yaml
# Email notifications on build failure
- task: EmailReport@1
  condition: failed()
  inputs:
    sendMailConditionConfig: 'failure'
```

### **GitHub Actions Monitoring**
```yaml
# Slack notifications (with webhook)
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### **Custom Alerts**
```bash
# Set up custom monitoring via webhooks
# Monitor test success rates
# Track execution times
# Alert on regression failures
```

---

## 🚀 **Deployment Strategies**

### **Multi-Environment Testing**
```yaml
# Environment-specific configurations
environments:
  - name: dev
    config: orangehrm-dev.json
  - name: staging  
    config: orangehrm-staging.json
  - name: prod
    config: orangehrm-prod.json
```

### **Progressive Deployment**
```bash
# Stage 1: Smoke tests on dev
npm run ci:smoke

# Stage 2: Regression on staging  
npm run ci:regression

# Stage 3: Production validation
npm run ci:prod-smoke
```

---

## 📋 **Best Practices**

### **Pipeline Design**
✅ **Fast Feedback** - Smoke tests run first (< 5 minutes)  
✅ **Parallel Execution** - Maximize concurrent test execution  
✅ **Conditional Logic** - Full regression only on main branch  
✅ **Artifact Management** - Retain results with appropriate lifecycle  

### **Configuration Management**
✅ **Environment Separation** - Different configs per environment  
✅ **Secret Management** - Use CI/CD secret stores  
✅ **Version Control** - All configurations in source control  
✅ **Documentation** - Clear setup and troubleshooting guides  

### **Quality Gates**
✅ **Mandatory Checks** - Tests must pass for PR merge  
✅ **Coverage Thresholds** - Maintain test coverage standards  
✅ **Performance Benchmarks** - Monitor execution time trends  
✅ **Failure Analysis** - Automatic retry for flaky tests  

---

## 🆘 **Troubleshooting**

### **Common Issues**

**Playwright Installation Failures:**
```bash
# Solution: Install with dependencies
npx playwright install --with-deps
```

**Browser Launch Timeouts:**
```bash
# Solution: Increase timeout in configuration
"timeout": 60000
```

**Test Flakiness:**
```bash
# Solution: Configure retries
"retries": 2
```

**Resource Constraints:**
```bash
# Solution: Optimize parallel execution
--browsers=chromium  # Use single browser for resource-constrained environments
```

### **Debug Commands**
```bash
# Local pipeline simulation
npm run ci:smoke     # Test smoke suite locally
npm run ci:regression # Test full regression locally

# Debug specific test
ts-node agents/executor.ts --app=orangehrm --file=your-test.txt --browsers=chromium --headed
```

---

## 🎯 **Success Metrics**

### **Pipeline Health**
- **Success Rate**: > 95% pipeline success rate
- **Execution Time**: < 30 minutes for full regression
- **Feedback Time**: < 5 minutes for smoke tests
- **Reliability**: < 2% false failure rate

### **Test Coverage**
- **Cross-Browser**: All critical flows tested on 3 browsers
- **Environment Coverage**: All target environments validated
- **Regression Coverage**: > 90% of user workflows covered
- **Performance**: Consistent execution times across runs

---

*This CI/CD integration makes your framework production-ready with enterprise-grade pipeline automation!* 🚀
