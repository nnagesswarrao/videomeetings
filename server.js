const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
var bodyParser = require('body-parser');
// Load environment variables
dotenv.config();

// Import database configuration

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
app.use(bodyParser.json());
// Mount routes

app.use('/api/users', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/chat', chatRoutes);

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`===================`);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Socket.IO Connection Handler with Enhanced WebRTC Support
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Room and User Management
    socket.on('join-room', (data) => {
        const { roomId, userName, meetingId } = data;
        console.log(`Detailed Join Room Event: 
            Room ID: ${roomId}, 
            User Name: ${userName}, 
            Socket ID: ${socket.id}`);

        // Add user to the room
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);
        
        // Store user information
        const userInfo = {
            socketId: socket.id,
            userName: userName,
            meetingId: meetingId
        };

        room.set(socket.id, userInfo);
        socket.join(roomId);

        // Get all existing users in the room
        const users = Array.from(room.values())
            .filter(user => user.socketId !== socket.id)
            .map(user => ({
                socketId: user.socketId,
                userName: user.userName
            }));

        console.log(`Room ${roomId} users:`, users);

        // Send all existing users to the newly joined user
        socket.emit('all-users', users);

        // Notify other users about the new user
        socket.to(roomId).emit('user-joined', {
            socketId: socket.id,
            userName: userName
        });

        console.log(`User ${userName} joined room ${roomId}. Total users: ${room.size}`);
    });

    // WebRTC Signaling
    socket.on('sending-signal', (data) => {
        const { userToSignal, callerId, signal, userName } = data;
        console.log(`Sending signal from ${callerId} to ${userToSignal}`);
        
        io.to(userToSignal).emit('user-joined', {
            signal,
            callerId,
            userName
        });
    });

    socket.on('returning-signal', (data) => {
        const { signal, callerId, userName } = data;
        console.log(`Returning signal from ${socket.id} to ${callerId}`);
        
        io.to(callerId).emit('receiving-returned-signal', {
            signal,
            id: socket.id
        });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and remove user from all rooms
        for (const [roomId, room] of rooms.entries()) {
            if (room.has(socket.id)) {
                const userInfo = room.get(socket.id);
                room.delete(socket.id);

                // Notify other users in the room
                socket.to(roomId).emit('user-left', socket.id);
                console.log(`User ${userInfo.userName} left room ${roomId}`);

                // Clean up empty rooms
                if (room.size === 0) {
                    rooms.delete(roomId);
                    console.log(`Room ${roomId} deleted - no users remaining`);
                }
                break;
            }
        }
    });

    // Media stream events
    socket.on('stream-changed', (data) => {
        const { roomId, streamType } = data;
        socket.to(roomId).emit('peer-stream-changed', {
            peerId: socket.id,
            streamType
        });
    });

    // Chat events
    socket.on('chat-message', (data) => {
        const { roomId, message } = data;
        io.to(roomId).emit('receive-chat-message', message);
    });

    // Participant control events
    socket.on('mute-participant', (data) => {
        const { roomId, participantId } = data;
        io.to(roomId).emit('participant-muted', {
            participantId,
            mutedBy: socket.id
        });
    });

    socket.on('raise-hand', (data) => {
        const { roomId, userName } = data;
        socket.to(roomId).emit('hand-raised', { userName });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log("========")
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
async function startServer() {
    try {
        // Test database connection
        

        // Start the server
        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
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
