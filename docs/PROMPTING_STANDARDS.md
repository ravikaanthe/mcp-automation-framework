# 🚀 Enterprise Prompting Standards for MCP Automation Framework

## 📋 Overview

This document defines the **standardized prompting rules** for creating test automation scripts that work seamlessly with our LLM-powered MCP Executor. Following these standards ensures:

- ✅ **100% Parser Compatibility** - Your prompts will be understood correctly
- ✅ **Enterprise Scalability** - Support for 1000+ test files
- ✅ **Team Consistency** - Everyone follows the same patterns
- ✅ **Zero Maintenance** - No parser updates needed for new tests

## 🎯 Core Principles

### 1. **Natural Language First**
Write prompts in clear, human-readable English. The LLM parser is designed to understand intent, not rigid syntax.

### 2. **Structured Formats**
Use consistent patterns that the parser recognizes automatically.

### 3. **Self-Documenting**
Include context and expected outcomes in your prompts.

---

## 📝 Standard Prompt Formats

### **Format 1: Step-by-Step Instructions**
```
Title: Login Test with Dashboard Verification
Tags: login, smoke, critical
Description: Verify successful login with valid credentials

1. Navigate to the application login page
2. Enter username "Admin" and password "admin123"
3. Click the login button
4. Verify that the dashboard page is displayed
5. Logout from the application
```

**✅ Parser Recognition**: Numbered steps (1., 2., 3., etc.)
**✅ Auto-Generated Actions**: Navigation, form filling, clicks, assertions

---

### **Format 2: Data-Driven External CSV**
```
Title: Login Test with Multiple Datasets
Tags: login, data-driven, regression
Description: Test login functionality with multiple user credentials from external file

Test Scenario: Login verification using external dataset
Data Source: loginData.csv
Test Steps:
1. For each row in loginData.csv, perform the following:
   - Navigate to login page
   - Enter username and password from CSV
   - Click login button
   - Verify expected result from CSV
   - Logout if login successful
```

**✅ Parser Recognition**: Keywords "loginData.csv", "external dataset", "data source"
**✅ Auto-Generated Actions**: CSV reading, iterative testing

---

### **Format 3: Data-Driven Inline Data**
```
Title: Login Test with Inline Datasets
Tags: login, data-driven, inline
Description: Test login with embedded test data

Test Scenario: Login verification with multiple inline datasets

Test Data:
- Username: Admin, Password: admin123, Expected: Dashboard visible
- Username: fakeuser, Password: fakepass, Expected: Invalid credentials error
- Username: ESSUser1, Password: ess123, Expected: Invalid credentials error

Steps:
1. For each dataset above, execute login test
2. Navigate to login page
3. Enter credentials as specified
4. Verify expected outcome
```

**✅ Parser Recognition**: "Username:", "Password:", "Expected:" patterns
**✅ Auto-Generated Actions**: Inline data extraction, parametrized testing

---

### **Format 4: Complex Workflow**
```
Title: Employee Management Complete Workflow
Tags: pim, employee, workflow, e2e
Description: End-to-end employee management process

Workflow Steps:
1. Login to application with Admin credentials
2. Navigate to PIM module
3. Click Add Employee button
4. Enter employee details:
   - First Name: "John123"
   - Last Name: "Doe456"
   - Employee ID: Auto-generate
5. Save employee record
6. Verify employee profile page displays correct information
7. Navigate back to employee list
8. Search for newly created employee
9. Logout from application
```

**✅ Parser Recognition**: Complex multi-step workflows with form data
**✅ Auto-Generated Actions**: Module navigation, form filling, verification sequences

---

## 🛠️ Naming Conventions

### **File Naming Standards**
```
✅ GOOD:
- login-with-valid-credentials.txt
- add-employee-pim-module.txt
- data-driven-login-external.txt
- user-profile-verification.txt

❌ AVOID:
- test1.txt
- logintest.txt
- Test_Login_123.txt
```

### **Title Standards**
```
✅ GOOD:
- "Login Test with Valid Credentials"
- "PIM Module - Add Employee Workflow"
- "Data-Driven Login with External CSV"

❌ AVOID:
- "Test 1"
- "Login"
- "TestLoginScenario"
```

---

## 🏷️ Tagging System

### **Standard Tags**
```yaml
Functional Areas:
  - login, logout, authentication
  - pim, employee, hr
  - admin, dashboard, reports
  - buzz, social, posts

Test Types:
  - smoke, critical, regression
  - data-driven, positive, negative
  - workflow, e2e, integration

Execution Priority:
  - p0, p1, p2, p3
  - critical, high, medium, low
```

### **Tag Usage Examples**
```
Tags: login, smoke, p0
Tags: pim, employee, workflow, regression
Tags: data-driven, login, external-csv
Tags: admin, reports, negative, p2
```

---

## 📊 Data-Driven Standards

### **CSV File Requirements**
```csv
Username,Password,Expected
Admin,admin123,Dashboard visible
fakeuser,fakepass,Invalid credentials
ESSUser1,ess123,Invalid credentials
```

**✅ Required**: Header row with column names
**✅ Location**: `test-data/` directory
**✅ Format**: Standard CSV with comma separators

### **Inline Data Format**
```
Username: [value], Password: [value], Expected: [result]
```

**✅ Pattern**: Consistent key-value pairs with commas
**✅ Keywords**: Username, Password, Expected (case-insensitive)

---

## 🔍 Element References

### **Standardized Element Descriptions**
```yaml
Login Elements:
  - "username input field"
  - "password input field"
  - "login button"
  - "error message"

Navigation Elements:
  - "PIM navigation link"
  - "Admin navigation link"
  - "Dashboard navigation link"
  - "user dropdown menu"

Form Elements:
  - "first name input field"
  - "last name input field"
  - "save button"
  - "cancel button"

Verification Elements:
  - "dashboard page"
  - "employee profile page"
  - "success message"
  - "error message"
```

---

## ✅ Verification Patterns

### **Standard Assertion Formats**
```
✅ Positive Verifications:
- "Verify that the dashboard page is displayed"
- "Confirm employee profile shows correct details"
- "Check that success message appears"

✅ Negative Verifications:
- "Verify error message for invalid credentials"
- "Confirm access denied message appears"
- "Check that user cannot access admin features"

✅ Content Verifications:
- "Verify page contains text 'Welcome Admin'"
- "Confirm employee name displays as 'John Doe'"
- "Check title shows 'OrangeHRM Dashboard'"
```

---

## 🚨 Common Anti-Patterns to Avoid

### **❌ Avoid These Patterns**

**1. Overly Technical Language**
```
❌ BAD: "Execute WebDriver click action on element with CSS selector #loginBtn"
✅ GOOD: "Click the login button"
```

**2. Hardcoded Selectors**
```
❌ BAD: "Click element with XPath //input[@id='username']"
✅ GOOD: "Enter username in username input field"
```

**3. Implementation Details**
```
❌ BAD: "Wait for DOM element to load using explicit wait"
✅ GOOD: "Wait for page to load"
```

**4. Inconsistent Data Formats**
```
❌ BAD: Mixed inline formats within same prompt
✅ GOOD: Consistent "Username: X, Password: Y, Expected: Z" format
```

---

## 📋 Template Library

### **Basic Login Template**
```
Title: [Descriptive Test Name]
Tags: login, [additional tags]
Description: [Brief description of test purpose]

1. Navigate to the application login page
2. Enter username "[username]" and password "[password]"
3. Click the login button
4. Verify [expected outcome]
```

### **Data-Driven Template**
```
Title: [Test Name] with Multiple Datasets
Tags: [functional area], data-driven, [test type]
Description: [Test purpose with data scope]

Test Scenario: [Brief scenario description]
Data Source: [filename.csv OR inline data below]

[Include either CSV reference OR inline data format]

Steps:
1. For each dataset, execute test scenario
2. [Additional steps if needed]
```

### **Workflow Template**
```
Title: [Module/Feature] Complete Workflow
Tags: [module], workflow, e2e
Description: [End-to-end process description]

Workflow Steps:
1. [Initial setup/navigation]
2. [Primary actions]
3. [Data entry/manipulation]
4. [Verification steps]
5. [Cleanup/logout]
```

---

## 🔧 Advanced Features

### **Conditional Logic Support**
```
1. Login with valid credentials
2. IF login successful:
   - Navigate to dashboard
   - Verify user welcome message
3. ELSE:
   - Verify error message appears
   - Attempt password reset
```

### **Loop Constructs**
```
1. FOR each employee in the list:
   - Click employee record
   - Verify employee details page
   - Navigate back to list
2. Confirm all employees processed
```

### **Environment Variables**
```
1. Navigate to {{APPLICATION_URL}}
2. Login with {{DEFAULT_USERNAME}} and {{DEFAULT_PASSWORD}}
3. Verify environment-specific content
```

---

## 📊 Compliance Checklist

Before submitting any prompt file, verify:

- [ ] **File Naming**: Follows kebab-case convention
- [ ] **Title**: Descriptive and clear
- [ ] **Tags**: Includes functional area and test type
- [ ] **Description**: Brief but informative
- [ ] **Format**: Uses one of the standard formats
- [ ] **Elements**: Uses standardized element descriptions
- [ ] **Data**: Follows CSV or inline data standards
- [ ] **Verification**: Includes clear expected outcomes
- [ ] **Language**: Natural and human-readable

---

## 🚀 Benefits of Following Standards

### **For Development Teams**
- ✅ **Faster Test Creation** - Copy proven templates
- ✅ **Reduced Errors** - Standards prevent common mistakes
- ✅ **Easy Maintenance** - Consistent patterns are easier to update

### **For QA Teams**
- ✅ **Reliable Execution** - Standards ensure parser compatibility
- ✅ **Predictable Results** - Known formats produce expected outputs
- ✅ **Easier Debugging** - Standard patterns are easier to troubleshoot

### **For Enterprise**
- ✅ **Scalability** - Framework handles 1000+ standardized tests
- ✅ **Consistency** - All teams follow same patterns
- ✅ **Maintainability** - Standards reduce technical debt

---

## 📞 Support and Examples

### **Example Files Reference**
- `prompts/Login_Datadriven_External.txt` - External CSV example
- `prompts/Login_Datadriven.txt` - Inline data example
- `prompts/addEmployeeVerification.txt` - Workflow example

### **Getting Help**
1. Check existing prompt files for similar scenarios
2. Reference this standards document
3. Use templates as starting points
4. Test with small datasets first

---

**Remember: The LLM parser is intelligent and forgiving, but following these standards ensures optimal performance and enterprise-grade reliability!**
