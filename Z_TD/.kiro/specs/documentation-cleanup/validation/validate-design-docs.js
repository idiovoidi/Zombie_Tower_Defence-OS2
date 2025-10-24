import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation results
const results = {
  totalDocs: 0,
  passed: 0,
  failed: 0,
  issues: [],
  duplicateContent: [],
  missingOverview: [],
  invalidReferences: [],
  noStandardStructure: []
};

// Standard sections expected in design docs
const standardSections = ['Overview', 'Architecture', 'Implementation', 'Examples', 'Testing'];

// Collect all markdown files in design_docs
function collectDesignDocs(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip My_Docs and task_summary
      if (!filePath.includes('My_Docs') && !filePath.includes('task_summary')) {
        collectDesignDocs(filePath, fileList);
      }
    } else if (file.endsWith('.md') && file !== 'README.md' && file !== 'INDEX.md') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if doc has Overview section
function hasOverviewSection(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.match(/^##?\s+Overview/i)) {
      return true;
    }
  }
  return false;
}

// Check for standard structure
function checkStandardStructure(content, filePath) {
  const lines = content.split('\n');
  const headers = lines
    .filter(line => line.match(/^##?\s+/))
    .map(line => line.replace(/^##?\s+/, '').trim());
  
  // Check if it has at least some standard sections
  const hasStandard = headers.some(h => 
    standardSections.some(s => h.toLowerCase().includes(s.toLowerCase()))
  );
  
  return {
    hasStandard,
    headers
  };
}

// Extract all markdown links and file references
function extractReferences(content) {
  const references = [];
  
  // Match [text](path) style links
  const mdLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  mdLinks.forEach(link => {
    const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (match && match[2]) {
      references.push({ type: 'markdown', path: match[2], text: match[1] });
    }
  });
  
  // Match #[[file:path]] style references
  const fileRefs = content.match(/#\[\[file:([^\]]+)\]\]/g) || [];
  fileRefs.forEach(ref => {
    const match = ref.match(/#\[\[file:([^\]]+)\]\]/);
    if (match && match[1]) {
      references.push({ type: 'file', path: match[1] });
    }
  });
  
  return references;
}

// Validate references exist
function validateReferences(references, docPath) {
  const invalid = [];
  const docDir = path.dirname(docPath);
  
  references.forEach(ref => {
    // Skip external URLs
    if (ref.path.startsWith('http://') || ref.path.startsWith('https://')) {
      return;
    }
    
    // Skip anchors
    if (ref.path.startsWith('#')) {
      return;
    }
    
    // Resolve relative path
    const refPath = path.resolve(docDir, ref.path);
    
    if (!fs.existsSync(refPath)) {
      invalid.push({
        doc: docPath,
        reference: ref.path,
        type: ref.type
      });
    }
  });
  
  return invalid;
}

// Check for duplicate content (simple heuristic: similar file names or repeated paragraphs)
function checkDuplicateContent(allDocs) {
  const duplicates = [];
  const contentMap = new Map();
  
  allDocs.forEach(doc => {
    const content = fs.readFileSync(doc.path, 'utf-8');
    const paragraphs = content
      .split('\n\n')
      .filter(p => p.trim().length > 100) // Only substantial paragraphs
      .map(p => p.trim());
    
    paragraphs.forEach(para => {
      if (contentMap.has(para)) {
        duplicates.push({
          paragraph: para.substring(0, 100) + '...',
          files: [contentMap.get(para), doc.path]
        });
      } else {
        contentMap.set(para, doc.path);
      }
    });
  });
  
  return duplicates;
}

// Main validation
function validateDesignDocs() {
  console.log('Validating design documentation...\n');
  
  const designDocsDir = path.join(path.resolve(__dirname, '../../../..'), 'design_docs');
  const allDocs = collectDesignDocs(designDocsDir);
  
  results.totalDocs = allDocs.length;
  console.log(`Found ${allDocs.length} design documents to validate\n`);
  
  const docData = [];
  
  allDocs.forEach(docPath => {
    const relativePath = path.relative(path.resolve(__dirname, '../../../..'), docPath);
    const content = fs.readFileSync(docPath, 'utf-8');
    const docIssues = [];
    
    // Check 1: Has Overview section
    if (!hasOverviewSection(content)) {
      docIssues.push('Missing Overview section');
      results.missingOverview.push(relativePath);
    }
    
    // Check 2: Standard structure
    const structure = checkStandardStructure(content, docPath);
    if (!structure.hasStandard) {
      docIssues.push('No standard structure sections found');
      results.noStandardStructure.push({
        file: relativePath,
        headers: structure.headers
      });
    }
    
    // Check 3: Validate cross-references
    const references = extractReferences(content);
    const invalidRefs = validateReferences(references, docPath);
    if (invalidRefs.length > 0) {
      docIssues.push(`${invalidRefs.length} invalid reference(s)`);
      results.invalidReferences.push(...invalidRefs);
    }
    
    // Track results
    if (docIssues.length === 0) {
      results.passed++;
    } else {
      results.failed++;
      results.issues.push({
        file: relativePath,
        issues: docIssues
      });
    }
    
    docData.push({ path: docPath, content });
  });
  
  // Check 4: Duplicate content
  console.log('Checking for duplicate content...');
  const duplicates = checkDuplicateContent(docData);
  results.duplicateContent = duplicates;
  
  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(80));
  console.log(`Total documents: ${results.totalDocs}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('');
  
  if (results.missingOverview.length > 0) {
    console.log(`\n❌ Missing Overview Section (${results.missingOverview.length}):`);
    results.missingOverview.forEach(file => console.log(`  - ${file}`));
  }
  
  if (results.noStandardStructure.length > 0) {
    console.log(`\n⚠️  No Standard Structure (${results.noStandardStructure.length}):`);
    results.noStandardStructure.forEach(item => {
      console.log(`  - ${item.file}`);
      console.log(`    Headers: ${item.headers.join(', ')}`);
    });
  }
  
  if (results.invalidReferences.length > 0) {
    console.log(`\n❌ Invalid References (${results.invalidReferences.length}):`);
    const rootDir = path.resolve(__dirname, '../../../..');
    results.invalidReferences.forEach(ref => {
      console.log(`  - ${path.relative(rootDir, ref.doc)}`);
      console.log(`    Missing: ${ref.reference}`);
    });
  }
  
  if (results.duplicateContent.length > 0) {
    console.log(`\n⚠️  Potential Duplicate Content (${results.duplicateContent.length}):`);
    const rootDir = path.resolve(__dirname, '../../../..');
    results.duplicateContent.slice(0, 5).forEach(dup => {
      console.log(`  - "${dup.paragraph}"`);
      console.log(`    Found in: ${dup.files.map(f => path.relative(rootDir, f)).join(', ')}`);
    });
    if (results.duplicateContent.length > 5) {
      console.log(`  ... and ${results.duplicateContent.length - 5} more`);
    }
  }
  
  if (results.issues.length > 0) {
    console.log(`\n\nDETAILED ISSUES:`);
    results.issues.forEach(issue => {
      console.log(`\n${issue.file}:`);
      issue.issues.forEach(i => console.log(`  - ${i}`));
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Save results to file
  const rootDir = path.resolve(__dirname, '../../../..');
  const reportPath = path.join(rootDir, '.kiro/specs/documentation-cleanup/validation/design-docs-validation.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results saved to: ${reportPath}`);
  
  return results.failed === 0;
}

// Run validation
const success = validateDesignDocs();
process.exit(success ? 0 : 1);
