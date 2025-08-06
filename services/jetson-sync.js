const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

// Jetson SCP config
const JETSON_USER = 'ses';
const JETSON_HOST = '10.0.8.81';
const REMOTE_PATH = '/home/ses/Desktop/safe_spots/events.txt';
const LOCAL_PATH = path.join(process.cwd(), 'public', 'params', 'status.txt');

// Background sync function
async function syncJetsonFile() {
    try {
        // Create temporary file for new content
        const tempPath = LOCAL_PATH + '.tmp';
        
        // Execute SCP command with timeout
        await execAsync(`scp -i ~/.ssh/test_mac_key -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${JETSON_USER}@${JETSON_HOST}:${REMOTE_PATH} ${tempPath}`, {
            timeout: 15000 // 15 second timeout
        });
        
        // Read new content and trim whitespace for comparison
        const newContent = (await fs.readFile(tempPath, 'utf-8')).trim();
        
        // Check if content actually changed
        let currentContent = '';
        try {
            currentContent = (await fs.readFile(LOCAL_PATH, 'utf-8')).trim();
        } catch {
            // File doesn't exist yet
        }
        
        // Only update if content actually changed (ignore whitespace differences)
        if (newContent !== currentContent) {
            await fs.writeFile(LOCAL_PATH, newContent, 'utf-8');
            console.log(`✓ Status file updated at ${new Date().toISOString()}`);
        }
        
        // Always clean up temp file
        try {
            await fs.unlink(tempPath);
        } catch {
            // Ignore if temp file doesn't exist
        }
        
    } catch (error) {
        // Only write error message if no file exists
        try {
            await fs.access(LOCAL_PATH);
        } catch {
            await fs.writeFile(LOCAL_PATH, 'Connection to Jetson lost. Retrying...', 'utf-8');
        }
    }
}

// Initialize with empty file
async function initialize() {
    try {
        // Ensure directory exists
        const dir = path.dirname(LOCAL_PATH);
        await fs.mkdir(dir, { recursive: true });
        
        // Create initial file if it doesn't exist
        try {
            await fs.access(LOCAL_PATH);
        } catch {
            await fs.writeFile(LOCAL_PATH, 'Initializing connection to Jetson...', 'utf-8');
        }
        
        console.log('Jetson sync service initialized');
        
        // Start immediate sync
        await syncJetsonFile();
        
        // Setup interval sync every 10 seconds (slower to reduce flicker)
        setInterval(syncJetsonFile, 10000);
        
    } catch (error) {
        console.error('Failed to initialize Jetson sync:', error.message);
    }
}

module.exports = { initialize, syncJetsonFile };
