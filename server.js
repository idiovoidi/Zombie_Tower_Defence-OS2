/**
 * Simple Express server for saving player reports
 * Run with: node server.js
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure player_reports directory exists
const reportsDir = path.join(__dirname, 'player_reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log('📁 Created player_reports directory');
}

// Save report endpoint
app.post('/api/save-report', (req, res) => {
  try {
    const { filename, data } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ error: 'Missing filename or data' });
    }

    const filepath = path.join(reportsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log(`✅ Saved report: ${filename}`);
    res.json({ success: true, filepath: `player_reports/${filename}` });
  } catch (error) {
    console.error('❌ Error saving report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', reportsDir: 'player_reports/' });
});

app.listen(PORT, () => {
  console.log(`🚀 Report server running on http://localhost:${PORT}`);
  console.log(`📁 Saving reports to: ${reportsDir}`);
});
