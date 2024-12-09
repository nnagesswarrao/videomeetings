const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserController {
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;
            
            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Create new user
            const result = await UserModel.create(username, email, password);
            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = UserController;
