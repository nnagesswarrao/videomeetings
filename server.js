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
                error: 'Invalid JSON'
            });
        }
    }
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// Mount routes
app.use('/api/users', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/chat', chatRoutes);

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

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

// Error handling middleware
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Database and Server Initialization
function startServer() {
    const PORT = process.env.PORT || 5001;
    const HOST = process.env.HOST || 'localhost';
    
    server.listen(PORT, HOST, () => {
        console.log(`Server running at http://${HOST}:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Database Initialization and Server Start
startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;
