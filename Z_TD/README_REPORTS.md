# Player Reports Setup

Player reports are automatically saved to the `player_reports/` folder when the report server is running.

## Quick Start

### Option 1: Run with automatic file saving (recommended)

```bash
# Install dependencies (first time only)
npm install

# Run both Vite dev server AND report server
npm run dev:full
```

This will start:
- Vite dev server on `http://localhost:8080`
- Report server on `http://localhost:3001`

Reports will automatically save to `player_reports/` folder.

### Option 2: Run without automatic saving

```bash
# Just run the game
npm run dev
```

Reports will download to your browser's default download folder. You'll need to manually move them to `player_reports/`.

## Manual Server Control

If you want to run the servers separately:

```bash
# Terminal 1: Run Vite dev server
npm run dev

# Terminal 2: Run report server
npm run server
```

## How It Works

When a game ends (AI or manual), the `LogExporter` will:
1. Try to save the report to the local server (if running)
2. If the server is running, the file is saved to `player_reports/`
3. If the server is NOT running, the file downloads to your browser

## Troubleshooting

**Reports still downloading instead of saving?**
- Make sure the report server is running (`npm run server` or `npm run dev:full`)
- Check the console for "✅ Report saved to: player_reports/..." message
- If you see "📊 Log downloaded" instead, the server isn't running

**Port 3001 already in use?**
- Edit `server.js` and change `const PORT = 3001;` to another port
- Update the port in `src/utils/LogExporter.ts` in the `saveToServer` method

**Server won't start?**
- Run `npm install` to ensure dependencies are installed
- Check that Node.js is installed: `node --version`
