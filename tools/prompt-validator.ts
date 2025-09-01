#!/usr/bin/env node

/**
 * 🔍 Prompt Standards Validator
 * 
 * Enterprise-grade validation tool to ensure prompt files follow
 * the established standards for optimal LLM parser compatibility.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface PromptAnalysis {
  hasTitle: boolean;
  hasTags: boolean;
  hasDescription: boolean;
  format: 'step-by-step' | 'data-driven-external' | 'data-driven-inline' | 'workflow' | 'unknown';
  dataPattern: string;
  elementReferences: string[];
  verificationPatterns: string[];
}

class PromptValidator {
  private standardTags = [
    // Functional areas
    'login', 'logout', 'authentication', 'pim', 'employee', 'hr', 'admin', 
    'dashboard', 'reports', 'buzz', 'social', 'posts',
    // Test types
    'smoke', 'critical', 'regression', 'data-driven', 'positive', 'negative',
    'workflow', 'e2e', 'integration',
    // Priorities
    'p0', 'p1', 'p2', 'p3', 'critical', 'high', 'medium', 'low'
  ];

  private standardElements = [
    'username input field', 'password input field', 'login button', 'error message',
    'PIM navigation link', 'Admin navigation link', 'dashboard page', 'user dropdown menu',
    'first name input field', 'last name input field', 'save button', 'cancel button',
    'employee profile page', 'success message', 'Add Employee button'
  ];

  private antiPatterns = [
    '#', 'xpath', 'css selector', 'WebDriver', 'DOM element', 'selenium',
    'driver.', 'findElement', 'click()', 'sendKeys()'
  ];

  /**
   * Validate a single prompt file
   */
  validateFile(filePath: string): ValidationResult {
    if (!fs.existsSync(filePath)) {
      return {
        isValid: false,
        score: 0,
        errors: [`File not found: ${filePath}`],
        warnings: [],
        suggestions: []
      };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const analysis = this.analyzePrompt(content);
    
    return this.generateValidationResult(path.basename(filePath), content, analysis);
  }

  /**
   * Validate all prompt files in a directory
   */
  validateDirectory(promptsDir: string): { [filename: string]: ValidationResult } {
    const results: { [filename: string]: ValidationResult } = {};

    if (!fs.existsSync(promptsDir)) {
      return { 'error': {
        isValid: false,
        score: 0,
        errors: [`Directory not found: ${promptsDir}`],
        warnings: [],
        suggestions: []
      }};
    }

    const files = fs.readdirSync(promptsDir)
      .filter(file => file.endsWith('.txt') || file.endsWith('.prompt'))
      .filter(file => file !== 'regression-suite.json');

    for (const file of files) {
      const filePath = path.join(promptsDir, file);
      results[file] = this.validateFile(filePath);
    }

    return results;
  }

  /**
   * Analyze prompt structure and patterns
   */
  private analyzePrompt(content: string): PromptAnalysis {
    const lines = content.split('\n');
    
    const analysis: PromptAnalysis = {
      hasTitle: false,
      hasTags: false,
      hasDescription: false,
      format: 'unknown',
      dataPattern: '',
      elementReferences: [],
      verificationPatterns: []
    };

    // Check for title
    analysis.hasTitle = lines.some(line => 
      line.toLowerCase().includes('title:') || 
      (lines.indexOf(line) < 3 && line.trim().length > 0 && !line.includes(':'))
    );

    // Check for tags
    analysis.hasTags = lines.some(line => line.toLowerCase().includes('tags:'));

    // Check for description
    analysis.hasDescription = lines.some(line => line.toLowerCase().includes('description:'));

    // Determine format
    analysis.format = this.detectFormat(content);

    // Extract element references
    analysis.elementReferences = this.extractElementReferences(content);

    // Extract verification patterns
    analysis.verificationPatterns = this.extractVerificationPatterns(content);

    // Detect data patterns
    analysis.dataPattern = this.detectDataPattern(content);

    return analysis;
  }

  /**
   * Detect prompt format type
   */
  private detectFormat(content: string): PromptAnalysis['format'] {
    const lowerContent = content.toLowerCase();

    // Check for step-by-step format
    if (/^\s*\d+\.\s/.test(content) || content.includes('1.') || content.includes('2.')) {
      return 'step-by-step';
    }

    // Check for external data-driven
    if (lowerContent.includes('.csv') || lowerContent.includes('data source:') || lowerContent.includes('external dataset')) {
      return 'data-driven-external';
    }

    // Check for inline data-driven
    if ((lowerContent.includes('username:') && lowerContent.includes('password:')) || 
        lowerContent.includes('test data:') || lowerContent.includes('following dataset:')) {
      return 'data-driven-inline';
    }

    // Check for workflow format
    if (lowerContent.includes('workflow') || lowerContent.includes('e2e') || lowerContent.includes('end-to-end')) {
      return 'workflow';
    }

    return 'unknown';
  }

  /**
   * Extract element references from content
   */
  private extractElementReferences(content: string): string[] {
    const references: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const element of this.standardElements) {
      if (lowerContent.includes(element.toLowerCase())) {
        references.push(element);
      }
    }

    return references;
  }

  /**
   * Extract verification patterns
   */
  private extractVerificationPatterns(content: string): string[] {
    const patterns: string[] = [];
    const verifyKeywords = ['verify', 'check', 'confirm', 'assert', 'validate'];

    const lines = content.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (verifyKeywords.some(keyword => lowerLine.includes(keyword))) {
        patterns.push(line.trim());
      }
    }

    return patterns;
  }

  /**
   * Detect data patterns in content
   */
  private detectDataPattern(content: string): string {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('username:') && lowerContent.includes('password:') && lowerContent.includes('expected:')) {
      return 'inline-structured';
    }

    if (lowerContent.includes('.csv')) {
      return 'external-csv';
    }

    if (lowerContent.includes('test data:') || lowerContent.includes('dataset:')) {
      return 'inline-unstructured';
    }

    return 'none';
  }

  /**
   * Generate comprehensive validation result
   */
  private generateValidationResult(filename: string, content: string, analysis: PromptAnalysis): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Required elements validation
    if (!analysis.hasTitle) {
      errors.push('Missing title - Add "Title: [descriptive name]" at the top');
      score -= 20;
    }

    if (!analysis.hasTags) {
      errors.push('Missing tags - Add "Tags: [functional-area], [test-type]"');
      score -= 15;
    }

    if (!analysis.hasDescription) {
      warnings.push('Missing description - Consider adding "Description: [brief purpose]"');
      score -= 5;
    }

    // Format validation
    if (analysis.format === 'unknown') {
      errors.push('Unrecognized format - Use step-by-step, data-driven, or workflow format');
      score -= 25;
    }

    // File naming validation
    if (!this.validateFileName(filename)) {
      warnings.push('File name should use kebab-case (e.g., login-test-valid-credentials.txt)');
      score -= 5;
    }

    // Anti-pattern detection
    const antiPatternIssues = this.detectAntiPatterns(content);
    errors.push(...antiPatternIssues.map(issue => `Anti-pattern detected: ${issue}`));
    score -= antiPatternIssues.length * 10;

    // Tag validation
    const tagIssues = this.validateTags(content);
    warnings.push(...tagIssues);
    score -= tagIssues.length * 3;

    // Element reference validation
    if (analysis.elementReferences.length === 0) {
      warnings.push('No standard element references found - Consider using standardized element descriptions');
      score -= 5;
    }

    // Verification pattern validation
    if (analysis.verificationPatterns.length === 0) {
      warnings.push('No verification steps found - Consider adding assertions');
      score -= 10;
    }

    // Data-driven specific validation
    if (analysis.format.includes('data-driven')) {
      const dataIssues = this.validateDataDrivenFormat(content, analysis);
      errors.push(...dataIssues.errors);
      warnings.push(...dataIssues.warnings);
      score -= dataIssues.errors.length * 15 + dataIssues.warnings.length * 5;
    }

    // Generate suggestions
    suggestions.push(...this.generateSuggestions(analysis, content));

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0 && score >= 70,
      score,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate file naming conventions
   */
  private validateFileName(filename: string): boolean {
    // Remove extension
    const baseName = filename.replace(/\.(txt|prompt)$/i, '');
    
    // Check if it follows kebab-case
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseName);
  }

  /**
   * Detect anti-patterns in content
   */
  private detectAntiPatterns(content: string): string[] {
    const issues: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const pattern of this.antiPatterns) {
      if (lowerContent.includes(pattern.toLowerCase())) {
        issues.push(`Technical implementation detail: "${pattern}"`);
      }
    }

    return issues;
  }

  /**
   * Validate tag usage
   */
  private validateTags(content: string): string[] {
    const issues: string[] = [];
    const tagLine = content.split('\n').find(line => line.toLowerCase().includes('tags:'));

    if (tagLine) {
      const tags = tagLine.split(':')[1]?.split(',').map(t => t.trim().toLowerCase()) || [];
      
      // Check if tags are from standard list
      const unknownTags = tags.filter(tag => !this.standardTags.includes(tag));
      if (unknownTags.length > 0) {
        issues.push(`Non-standard tags found: ${unknownTags.join(', ')} - Consider using standard tags`);
      }

      // Check for functional area tag
      const functionalTags = ['login', 'pim', 'admin', 'dashboard', 'buzz'];
      if (!tags.some(tag => functionalTags.includes(tag))) {
        issues.push('Missing functional area tag (login, pim, admin, dashboard, buzz)');
      }

      // Check for test type tag
      const testTypeTags = ['smoke', 'regression', 'data-driven', 'workflow', 'e2e'];
      if (!tags.some(tag => testTypeTags.includes(tag))) {
        issues.push('Missing test type tag (smoke, regression, data-driven, workflow, e2e)');
      }
    }

    return issues;
  }

  /**
   * Validate data-driven format specifics
   */
  private validateDataDrivenFormat(content: string, analysis: PromptAnalysis): { errors: string[], warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (analysis.format === 'data-driven-external') {
      // Check for CSV file reference
      if (!content.toLowerCase().includes('.csv')) {
        errors.push('External data-driven test must reference a CSV file');
      }
      
      // Check for proper CSV naming
      const csvMatch = content.match(/(\w+\.csv)/i);
      if (csvMatch && !csvMatch[1].toLowerCase().includes('data')) {
        warnings.push('CSV file should include "data" in name (e.g., loginData.csv)');
      }
    }

    if (analysis.format === 'data-driven-inline') {
      // Check for proper inline format
      if (!content.includes('Username:') || !content.includes('Password:') || !content.includes('Expected:')) {
        errors.push('Inline data must follow "Username: X, Password: Y, Expected: Z" format');
      }
    }

    return { errors, warnings };
  }

  /**
   * Generate helpful suggestions
   */
  private generateSuggestions(analysis: PromptAnalysis, content: string): string[] {
    const suggestions: string[] = [];

    if (analysis.format === 'step-by-step' && analysis.verificationPatterns.length === 0) {
      suggestions.push('Add verification steps to ensure test completeness');
    }

    if (analysis.elementReferences.length < 3) {
      suggestions.push('Use more standardized element descriptions for better parser recognition');
    }

    if (!content.toLowerCase().includes('logout') && content.toLowerCase().includes('login')) {
      suggestions.push('Consider adding logout step for complete test isolation');
    }

    if (analysis.format === 'data-driven-inline' && content.split('Username:').length > 4) {
      suggestions.push('Consider using external CSV for datasets with 3+ test cases');
    }

    return suggestions;
  }

  /**
   * Generate detailed report
   */
  generateReport(results: { [filename: string]: ValidationResult }): string {
    let report = '# 🔍 Prompt Standards Validation Report\n\n';
    
    const totalFiles = Object.keys(results).length;
    const validFiles = Object.values(results).filter(r => r.isValid).length;
    const avgScore = Object.values(results).reduce((sum, r) => sum + r.score, 0) / totalFiles;

    report += `## 📊 Summary\n`;
    report += `- **Total Files**: ${totalFiles}\n`;
    report += `- **Valid Files**: ${validFiles} (${Math.round(validFiles/totalFiles*100)}%)\n`;
    report += `- **Average Score**: ${Math.round(avgScore)}/100\n\n`;

    report += `## 📋 Detailed Results\n\n`;

    for (const [filename, result] of Object.entries(results)) {
      const status = result.isValid ? '✅' : '❌';
      report += `### ${status} ${filename} (Score: ${result.score}/100)\n\n`;

      if (result.errors.length > 0) {
        report += `**❌ Errors:**\n`;
        result.errors.forEach(error => report += `- ${error}\n`);
        report += '\n';
      }

      if (result.warnings.length > 0) {
        report += `**⚠️ Warnings:**\n`;
        result.warnings.forEach(warning => report += `- ${warning}\n`);
        report += '\n';
      }

      if (result.suggestions.length > 0) {
        report += `**💡 Suggestions:**\n`;
        result.suggestions.forEach(suggestion => report += `- ${suggestion}\n`);
        report += '\n';
      }

      report += '---\n\n';
    }

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const validator = new PromptValidator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('🔍 Prompt Standards Validator');
    console.log('Usage: node prompt-validator.js <file-or-directory>');
    console.log('Example: node prompt-validator.js prompts/');
    process.exit(1);
  }

  const target = args[0];
  const isDirectory = fs.statSync(target).isDirectory();

  if (isDirectory) {
    console.log(`🔍 Validating all prompts in: ${target}\n`);
    const results = validator.validateDirectory(target);
    const report = validator.generateReport(results);
    
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(target, 'validation-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📝 Full report saved to: ${reportPath}`);
  } else {
    console.log(`🔍 Validating file: ${target}\n`);
    const result = validator.validateFile(target);
    
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    console.log(`${status} - Score: ${result.score}/100\n`);

    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
      console.log();
    }

    if (result.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log();
    }

    if (result.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
      console.log();
    }
  }
}

export { PromptValidator, ValidationResult, PromptAnalysis };
