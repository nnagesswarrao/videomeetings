const UserModel = require('../models/userModel');

class UserController {
    // User Registration
    static async register(req, res) {
        // Log the entire incoming request body
        console.log('Signup Request Body:', req.body);

        // Ensure first_name and last_name are set
        req.body['first_name'] = req.body['first_name'] || 'TEST';
        req.body['last_name'] = req.body['last_name'] || 'TEST';
        req.body['job_title'] = req.body['job_title'] || 'TEST';
        req.body['department'] = req.body['department'] || 'TEST';

        try {
            const { 
                name, 
                email, 
                password, 
                first_name, 
                last_name ,
                job_title, 
                department
            } = req.body;

            // Detailed logging of destructured values
            console.log('Extracted Values:', {
                name, 
                email, 
                passwordLength: password ? password.length : 'No password',
                first_name, 
                last_name
            });

            // Basic validation with more detailed error messages
            const errors = [];
            if (!name) errors.push('Name is required');
            if (!email) errors.push('Email is required');
            if (!password) errors.push('Password is required');

            if (errors.length > 0) {
                return res.status(400).json({ 
                    message: 'Validation Failed', 
                    errors 
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'Invalid email format',
                    field: 'email'
                });
            }

            // Password strength validation
            if (password.length < 8) {
                return res.status(400).json({ 
                    message: 'Password must be at least 8 characters long',
                    field: 'password'
                });
            }

            const userId = await UserModel.create({
                name, 
                email, 
                password, 
                first_name, 
                last_name,
                job_title, 
                department
            });

            res.status(201).json({ 
                message: 'User registered successfully', 
                userId 
            });
        } catch (error) {
            // Comprehensive error logging
            console.error('Registration Error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Handle specific error types
            if (error.message.includes('User already exists')) {
                return res.status(409).json({ 
                    message: 'User with this email already exists',
                    field: 'email'
                });
            }

            res.status(500).json({ 
                message: 'Registration failed', 
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
            });
        }
    }

    // User Login
    static async login(req, res) {
        console.log("======", req.body)
        try {
            const { email, password } = req.body;
            const { user, token } = await UserModel.login(email, password);
            
            res.json({ 
                message: 'Login successful', 
                user, 
                token 
            });
        } catch (error) {
            res.status(401).json({ 
                message: error.message 
            });
        }
    }

    // Get User Profile
    static async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ 
                message: 'User not found' 
            });
        }
    }

    // Update User Profile
    static async updateProfile(req, res) {
        try {
            const updatedUser = await UserModel.updateProfile(
                req.user.id, 
                req.body
            );
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    }

    // Change Password
    static async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            await UserModel.changePassword(
                req.user.id, 
                oldPassword, 
                newPassword
            );
            res.json({ 
                message: 'Password changed successfully' 
            });
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    }

    // Get User Status
    static async getUserStatus(req, res) {
        try {
            const status = await UserModel.getUserStatus(req.user.id);
            res.json(status);
        } catch (error) {
            res.status(404).json({ 
                message: 'Status not found' 
            });
        }
    }

    // Update User Status
    static async updateUserStatus(req, res) {
        try {
            const { status, statusMessage } = req.body;
            const updatedStatus = await UserModel.updateUserStatus(
                req.user.id, 
                status, 
                statusMessage
            );
            res.json(updatedStatus);
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    }
}

module.exports = UserController;
