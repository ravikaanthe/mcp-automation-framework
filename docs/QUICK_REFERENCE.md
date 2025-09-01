# 🚀 MCP Framework - Quick Reference

## 🎯 **Three Ways to Execute Tests**

### **1. NPM Scripts (Recommended)**
```bash
npm run ci:buzz           # VerifyBuzzPostVerification.txt
npm run ci:pim            # verifyPIMPage.txt  
npm run ci:login          # Login_Datadriven.txt
npm run ci:employee       # addEmployeeVerification.txt
npm run ci:smoke          # Smoke test suite
npm run ci:regression     # Full regression suite
```

### **2. Enhanced CLI Interface**
```bash
# List available applications
ts-node cli/executor-cli.ts --list-apps

# Run specific test
ts-node cli/executor-cli.ts --app=orangehrm --file=Login_Datadriven.txt

# Cross-browser execution
ts-node cli/executor-cli.ts --app=orangehrm --file=VerifyBuzzPostVerification.txt --browsers=chromium,firefox,webkit
```

### **3. Direct Executor**
```bash
# Basic execution
ts-node agents/executor.ts --app=orangehrm --file=verifyPIMPage.txt

# Multi-browser
ts-node agents/executor.ts --app=orangehrm --file=Login_Datadriven.txt --browsers=chromium,firefox
```

## 📁 **Application Configuration**

### **Current Applications**
- `orangehrm` - OrangeHRM HR management system
- `genericweb` - Generic web application template  
- `shopify` - Shopify e-commerce platform

### **Adding New Applications**
1. Create `config/app-configs/your-app.json`
2. Define element descriptions (human-readable, not CSS selectors)
3. Set baseUrl, credentials, and test context
4. Use `--app=your-app` in commands

## ✍️ **Writing Test Prompts**

### **Required Headers**
```
Title: [Descriptive Test Name]
Priority: P1|P2|P3  
Tags: [functional-area], [test-type], [priority]

[Test content]
```

### **Standard Formats**

**Step-by-Step Instructions:**
```
Test Steps:
1. Navigate to the application
2. Login with valid credentials  
3. Verify dashboard is displayed
4. Logout from the application
```

**Data-Driven External CSV:**
```
Data Source: loginData.csv
Test Steps:
1. Navigate to application
2. Login with credentials from {username} and {password} columns
3. Verify login result matches {expected} column
```

**Data-Driven Inline:**
```
Test Data:
- Username: Admin, Password: admin123, Expected: Success
- Username: InvalidUser, Password: wrongpass, Expected: Failure

Test Steps:
1. Login with each set of credentials
2. Verify expected outcome
```

## 🏷️ **Standard Tags**

**Functional Areas:** `login`, `pim`, `admin`, `dashboard`, `buzz`, `employee`  
**Test Types:** `smoke`, `regression`, `data-driven`, `workflow`, `e2e`  
**Priority:** `p0`, `p1`, `p2`, `p3`, `critical`, `high`, `medium`, `low`

## 🌐 **Browser Options**

```bash
--browsers=chromium                    # Single browser (fastest)
--browsers=chromium,firefox            # Two browsers  
--browsers=chromium,firefox,webkit     # All supported (complete coverage)
```

## 🎯 **Common Workflows**

### **Development & Testing**
```bash
# 1. Write test prompt in prompts/your-test.txt
# 2. Test locally  
ts-node cli/executor-cli.ts --app=orangehrm --file=your-test.txt --browsers=chromium

# 3. Validate cross-browser
ts-node agents/executor.ts --app=orangehrm --file=your-test.txt --browsers=chromium,firefox,webkit
```

### **CI/CD Pipeline**
```bash
npm run ci:smoke           # Quick validation
npm run ci:regression      # Full test suite
```

## 🔧 **Configuration Examples**

### **Basic Application Config**
```json
{
  "name": "YourApp",
  "baseUrl": "https://your-app.com",
  "defaultCredentials": {
    "username": "test-user",
    "password": "test-pass"
  },
  "elements": {
    "loginPage": {
      "username": "username input field",
      "password": "password input field",
      "loginButton": "login button"
    }
  }
}
```

### **Environment Settings**
```json
{
  "environment": {
    "timeout": 30000,
    "retries": 2, 
    "browsers": ["chromium", "firefox"],
    "headless": false
  }
}
```

## 🚀 **Framework Benefits**

✅ **No Code Changes** - Pure configuration-driven  
✅ **Natural Language** - Write tests in plain English  
✅ **Multi-Application** - Unlimited apps via JSON  
✅ **Cross-Browser** - Built-in browser compatibility  
✅ **Enterprise Ready** - Scales across organizations

### 🎯 **Element Descriptions**
```yaml
Form Fields: "username input field", "password input field"
Buttons: "login button", "save button", "cancel button"
Navigation: "PIM navigation link", "user dropdown menu"
Pages: "dashboard page", "employee profile page"
Messages: "success message", "error message"
```

### 📊 **Data Formats**

**CSV Structure:**
```csv
Username,Password,Expected
Admin,admin123,Dashboard visible
invalid,wrong,Invalid credentials
```

**Inline Pattern:**
```
Username: [value], Password: [value], Expected: [result]
```

### ✅ **Verification Patterns**
```
✅ "Verify that [element] is displayed"
✅ "Confirm [element] contains text '[text]'"
✅ "Check that [condition] is true"
```

---

## 🚨 **Common Mistakes to Avoid**

❌ Technical selectors: `#loginBtn, xpath://input`
❌ Implementation details: `WebDriver click action`
❌ Inconsistent data formats
❌ Missing tags or descriptions
❌ Unclear element references

---

## 📁 **File Organization**

```
prompts/
  ├── login-tests/
  ├── pim-workflows/
  ├── admin-features/
  └── data-driven/

test-data/
  ├── loginData.csv
  ├── employeeData.csv
  └── adminUsers.csv
```

---

**🎯 Remember: Natural language + Standard patterns = Perfect parsing!**
