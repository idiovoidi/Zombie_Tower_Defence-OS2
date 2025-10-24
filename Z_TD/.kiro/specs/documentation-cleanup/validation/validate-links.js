/**
 * Validation script for links and references
 * Checks: internal links, file references, #[[file:...]] references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../../../..');
const DOCS_DIRS = [
  path.join(ROOT_DIR, 'design_docs'),
  path.join(ROOT_DIR, '.kiro/steering'),
  path.join(ROOT_DIR, '.kiro/specs')
];

const results = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  validLinks: 0
};

function extractMarkdownLinks(content) {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkPattern.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      type: 'markdown'
    });
  }
  
  return links;
}

function extractFileReferences(content) {
  // Extract #[[file:...]] references
  const fileRefPattern = /#\[\[file:([^\]]+)\]\]/g;
  const refs = [];
  let match;
  
  while ((match = fileRefPattern.exec(content)) !== null) {
    refs.push({
      text: match[1],
      url: match[1],
      type: 'file-ref'
    });
  }
  
  return refs;
}

function validateLink(filePath, link) {
  // Skip external links
  if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
    return { valid: true, reason: 'external' };
  }
  
  // Skip anchors
  if (link.url.startsWith('#')) {
    return { valid: true, reason: 'anchor' };
  }
  
  // Skip mailto links
  if (link.url.startsWith('mailto:')) {
    return { valid: true, reason: 'mailto' };
  }
  
  const fileDir = path.dirname(filePath);
  
  // Handle anchor links in URLs
  let urlPath = link.url;
  if (urlPath.includes('#')) {
    urlPath = urlPath.split('#')[0];
  }
  
  // Skip empty paths (pure anchors)
  if (!urlPath) {
    return { valid: true, reason: 'anchor-only' };
  }
  
  // Resolve relative path
  const resolvedPath = path.resolve(fileDir, urlPath);
  
  if (!fs.existsSync(resolvedPath)) {
    return { 
      valid: false, 
      reason: 'not-found',
      resolvedPath 
    };
  }
  
  return { valid: true, reason: 'exists' };
}

function validateFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract all links
  const markdownLinks = extractMarkdownLinks(content);
  const fileRefs = extractFileReferences(content);
  const allLinks = [...markdownLinks, ...fileRefs];
  
  results.totalLinks += allLinks.length;
  
  const brokenLinks = [];
  
  for (const link of allLinks) {
    const validation = validateLink(filePath, link);
    
    if (validation.valid) {
      results.validLinks++;
    } else {
      brokenLinks.push({
        link,
        validation
      });
    }
  }
  
  return { 
    linkCount: allLinks.length, 
    brokenLinks 
  };
}

function walkDirectory(dir, baseDir = dir, excludeDirs = ['node_modules', 'coverage', 'dist', '.git']) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(file)) {
        continue;
      }
      walkDirectory(filePath, baseDir, excludeDirs);
    } else if (file.endsWith('.md')) {
      results.totalFiles++;
      const relativePath = path.relative(ROOT_DIR, filePath);
      const result = validateFile(filePath, relativePath);
      
      if (result.brokenLinks.length > 0) {
        results.brokenLinks.push({
          file: relativePath,
          links: result.brokenLinks
        });
      }
    }
  }
}

// Run validation
console.log('Validating links and references...\n');

for (const dir of DOCS_DIRS) {
  walkDirectory(dir, ROOT_DIR);
}

// Report results
console.log('=== VALIDATION RESULTS ===\n');

if (results.brokenLinks.length > 0) {
  console.log('❌ FILES WITH BROKEN LINKS:\n');
  
  // Limit output to first 20 files
  const displayFiles = results.brokenLinks.slice(0, 20);
  
  for (const item of displayFiles) {
    console.log(`  ${item.file}`);
    for (const broken of item.links.slice(0, 5)) {
      console.log(`    ❌ [${broken.link.text}](${broken.link.url})`);
      if (broken.validation.resolvedPath) {
        console.log(`       Resolved to: ${path.relative(ROOT_DIR, broken.validation.resolvedPath)}`);
      }
    }
    if (item.links.length > 5) {
      console.log(`    ... and ${item.links.length - 5} more broken links`);
    }
    console.log('');
  }
  
  if (results.brokenLinks.length > 20) {
    console.log(`... and ${results.brokenLinks.length - 20} more files with broken links\n`);
  }
}

console.log('=== SUMMARY ===');
console.log(`Total files scanned: ${results.totalFiles}`);
console.log(`Total links found: ${results.totalLinks}`);
console.log(`Valid links: ${results.validLinks}`);
console.log(`Broken links: ${results.totalLinks - results.validLinks}`);
console.log(`Files with broken links: ${results.brokenLinks.length}`);

if (results.brokenLinks.length > 0) {
  console.log('\n⚠️  Some links are broken. Review and fix them.');
  process.exit(1);
} else {
  console.log('\n✅ All links are valid!');
  process.exit(0);
}
