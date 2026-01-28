import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This ensures we find the 'dist' folder relative to the 'server' folder
const distPath = path.resolve(__dirname, '../dist');

// Log this so you can see it in Render Logs
console.log("Serving static files from:", distPath);

if (fs.existsSync(distPath)) {
    // 1. Serve static assets (JS, CSS, Images)
    app.use(express.static(distPath));

    // 2. Catch-all for React Routing (MUST be after API routes)
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
} else {
    console.error("❌ ERROR: dist folder not found at", distPath);
}