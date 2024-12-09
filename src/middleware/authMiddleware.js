const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    try {
        // Check for token in Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Extract token (expecting "Bearer <token>")
        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request
        req.token = token;
        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ 
            message: 'Authentication error', 
            error: error.message 
        });
    }
};

module.exports = authMiddleware;
