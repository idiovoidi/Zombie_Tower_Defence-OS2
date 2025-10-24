import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Archive validation script
const archiveDir = path.join(__dirname, '../../../../design_docs/Archive');

const issues = [];
const warnings = [];

function validateArchiveFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Skip README files
  if (fileName === 'README.md') return;
  
  // Check for completion date
  const hasCompletionDate = /\*\*Completed:\*\*\s+\d{4}/.test(content);
  if (!hasCompletionDate) {
    issues.push(`❌ ${relativePath}: Missing completion date (format: **Completed:** YYYY)`);
  }
  
  // Check for verification status
  const hasVerificationStatus = /\*\*Verification Status:\*\*/.test(content);
  if (!hasVerificationStatus) {
    issues.push(`❌ ${relativePath}: Missing verification status`);
  }
  
  // Check if verified
  const isVerified = /✅\s+Verified/.test(content);
  if (!isVerified) {
    warnings.push(`⚠️  ${relativePath}: Not marked as verified`);
  }
  
  // Check for links to current docs (Related Documentation section)
  const hasRelatedDocs = /## Related Documentation/i.test(content);
  if (!hasRelatedDocs) {
    warnings.push(`⚠️  ${relativePath}: Missing "Related Documentation" section`);
  }
  
  // Check for at least one link to current docs
  const hasLinks = /\[.*\]\(\.\.\/.*\.md\)/.test(content);
  if (!hasLinks) {
    warnings.push(`⚠️  ${relativePath}: No links to current documentation found`);
  }
  
  // Check for status marker at end
  const hasStatusComplete = /\*\*Status\*\*:\s+✅\s+Complete/i.test(content);
  if (!hasStatusComplete) {
    warnings.push(`⚠️  ${relativePath}: Missing "**Status**: ✅ Complete" marker at end`);
  }
}

function walkDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(baseDir, filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, baseDir);
    } else if (file.endsWith('.md')) {
      validateArchiveFile(filePath, relativePath);
    }
  });
}

console.log('🔍 Validating Archive Entries...\n');

walkDirectory(archiveDir);

console.log('📊 Validation Results:\n');

if (issues.length === 0) {
  console.log('✅ All archive entries have completion dates and verification status!\n');
} else {
  console.log(`❌ Found ${issues.length} critical issue(s):\n`);
  issues.forEach(issue => console.log(issue));
  console.log('');
}

if (warnings.length > 0) {
  console.log(`⚠️  Found ${warnings.length} warning(s):\n`);
  warnings.forEach(warning => console.log(warning));
  console.log('');
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 All archive entries are properly formatted!\n');
  process.exit(0);
} else {
  console.log(`\n📝 Summary: ${issues.length} critical issues, ${warnings.length} warnings\n`);
  process.exit(issues.length > 0 ? 1 : 0);
}
