#!/usr/bin/env node

// Startup script to initialize background services
const { initialize } = require('./services/jetson-sync.js');

console.log('🚀 Starting Drone Sync Background Services...');

// Initialize Jetson sync service
initialize().then(() => {
    console.log('✅ All background services started successfully');
}).catch((error) => {
    console.error('❌ Failed to start background services:', error.message);
    process.exit(1);
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down background services...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down background services...');
    process.exit(0);
});
