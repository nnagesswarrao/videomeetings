const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database initialization
// const initializeDatabase = require('./src/utils/initDb');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(helmet()); // Adds security headers
app.use(compression()); // Compress responses

// Enhanced JSON parsing middleware
app.use(express.json({
    limit: '10mb', // Increase payload size limit
    strict: true, // Only accept arrays and objects
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            res.status(400).json({ 
                message: 'Invalid JSON payload',
                error: e.message 
            });
            throw e;
        }
    }
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// Logging Middleware with more detailed request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    // Log request body for debugging
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log('New client connected');

    // Meeting-related events
    socket.on('join-meeting', (meetingId) => {
        socket.join(meetingId);
        console.log(`User joined meeting: ${meetingId}`);
    });

    // Chat events
    socket.on('send-message', (message) => {
        // Broadcast message to meeting room
        io.to(message.meetingId).emit('receive-message', message);
    });

    // Participant control events
    socket.on('mute-participant', (data) => {
        io.to(data.meetingId).emit('participant-muted', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Server Configuration
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || 'localhost';

// Database Initialization and Server Start
async function startServer() {
    try {
        // Initialize Database
        // await initializeDatabase();
        console.log('Database initialized successfully');

        // Start server
        server.listen(PORT, HOST, () => {
            console.log(`Server running at http://${HOST}:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();
