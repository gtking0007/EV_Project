/**
 * server/server.js
 * 
 * Main entry point for the Collaborative Wireframing Tool.
 * Sets up Express, HTTP server, and initializes the Socket.IO logic.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes');
const socketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS support
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

/**
 * MIDDLEWARE
 */
app.use(express.json());

/**
 * ROUTES
 * servre static frontend files and provide fallbacks for the SPA.
 */
app.use('/', routes);

/**
 * REAL-TIME COLLABORATION
 * Start the shared state and handle connection-based events.
 */
socketHandler(io);

/**
 * SERVER STARTUP
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 Collaborative Wireframing Tool: Ready`);
    console.log(`📡 Real-time synchronization active on port ${PORT}`);
    console.log(`🌍 Visit http://localhost:${PORT} to collaborate!\n`);
});

// Error handling to prevent the server from crashing on unexpected exceptions
process.on('uncaughtException', (err) => {
    console.error('Critical Server Exception:', err);
});
