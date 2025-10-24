/**
 * Validation script for steering rules
 * Checks: line count, frontmatter, implementation details, code examples
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STEERING_DIR = path.join(__dirname, '../../../steering');
const MAX_LINES = 200;

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function countLines(content) {
  return content.split('\n').length;
}

function hasFrontmatter(content) {
  return content.trim().startsWith('---');
}

function parseFrontmatter(content) {
  if (!hasFrontmatter(content)) return null;
  
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  return frontmatter;
}

function hasImplementationDetails(content) {
  // Check for detailed implementation patterns
  const detailPatterns = [
    /class\s+\w+\s+extends/gi,
    /constructor\s*\(/gi,
    /private\s+\w+:/gi,
    /public\s+\w+\s*\(/gi,
    /interface\s+\w+\s*{[\s\S]{100,}}/gi, // Large interfaces
  ];
  
  let detailCount = 0;
  for (const pattern of detailPatterns) {
    const matches = content.match(pattern);
    if (matches) detailCount += matches.length;
  }
  
  // More than 3 detailed implementations is a warning
  return detailCount > 3;
}

function hasMinimalCodeExamples(content) {
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  
  for (const block of codeBlocks) {
    const lines = block.split('\n').length;
    if (lines > 30) {
      return false; // Code example too large
    }
  }
  
  return true;
}

function validateFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lineCount = countLines(content);
  const frontmatter = parseFrontmatter(content);
  
  const issues = [];
  const warnings = [];
  
  // Check line count
  if (lineCount > MAX_LINES) {
    issues.push(`Exceeds ${MAX_LINES} lines (${lineCount} lines)`);
  }
  
  // Check frontmatter (except README)
  if (!relativePath.includes('README.md')) {
    if (!hasFrontmatter(content)) {
      warnings.push('Missing frontmatter (consider adding inclusion type)');
    } else if (frontmatter && !frontmatter.inclusion) {
      warnings.push('Frontmatter missing "inclusion" field');
    }
  }
  
  // Check for implementation details
  if (hasImplementationDetails(content)) {
    warnings.push('Contains detailed implementation code (consider moving to design docs)');
  }
  
  // Check code example size
  if (!hasMinimalCodeExamples(content)) {
    issues.push('Contains code examples >30 lines (should be minimal)');
  }
  
  return { lineCount, frontmatter, issues, warnings };
}

function walkDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, baseDir);
    } else if (file.endsWith('.md')) {
      const relativePath = path.relative(baseDir, filePath);
      const result = validateFile(filePath, relativePath);
      
      if (result.issues.length > 0) {
        results.failed.push({
          file: relativePath,
          lineCount: result.lineCount,
          issues: result.issues,
          warnings: result.warnings
        });
      } else {
        results.passed.push({
          file: relativePath,
          lineCount: result.lineCount,
          warnings: result.warnings
        });
      }
    }
  }
}

// Run validation
console.log('Validating steering rules...\n');
walkDirectory(STEERING_DIR);

// Report results
console.log('=== VALIDATION RESULTS ===\n');

if (results.failed.length > 0) {
  console.log('❌ FAILED FILES:\n');
  for (const item of results.failed) {
    console.log(`  ${item.file} (${item.lineCount} lines)`);
    for (const issue of item.issues) {
      console.log(`    ❌ ${issue}`);
    }
    for (const warning of item.warnings) {
      console.log(`    ⚠️  ${warning}`);
    }
    console.log('');
  }
}

if (results.passed.length > 0) {
  console.log('✅ PASSED FILES:\n');
  for (const item of results.passed) {
    console.log(`  ${item.file} (${item.lineCount} lines)`);
    if (item.warnings.length > 0) {
      for (const warning of item.warnings) {
        console.log(`    ⚠️  ${warning}`);
      }
    }
  }
  console.log('');
}

console.log('=== SUMMARY ===');
console.log(`Total files: ${results.passed.length + results.failed.length}`);
console.log(`Passed: ${results.passed.length}`);
console.log(`Failed: ${results.failed.length}`);

// Exit with error code if any failures
process.exit(results.failed.length > 0 ? 1 : 0);
