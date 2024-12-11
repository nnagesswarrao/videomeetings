const { query } = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserModel {
    // User Registration
    static async create(userData) {
        const { 
            name, 
            email, 
            password, 
            first_name, 
            last_name, 
            job_title, 
            department 
        } = userData;

        // Check if user already exists
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const sql = `
            INSERT INTO users 
            (
            name, email, password
            ) 
            VALUES (?, ?, ?)
        `;
        const result = await query(sql, [
            name, 
            email, 
            hashedPassword
        ]);

        return result.insertId;
    }

    // User Login
    static async login(email, password) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Remove sensitive information
        delete user.password;

        return { user, token };
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        console.log(results,"=====")
        return results[0];
    }

    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT id, name, email, first_name, last_name, job_title, department FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0];
    }

    // Update user profile
    static async updateProfile(userId, updateData) {
        const { first_name, last_name, job_title, department, profile_picture } = updateData;
        
        const sql = `
            UPDATE users 
            SET first_name = ?, last_name = ?, job_title = ?, 
                department = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        
        await query(sql, [
            first_name, 
            last_name, 
            job_title, 
            department, 
            profile_picture, 
            userId
        ]);

        return this.findById(userId);
    }

    // Change user password
    static async changePassword(userId, oldPassword, newPassword) {
        // Fetch current user
        const user = await this.findById(userId);
        
        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        await query(sql, [hashedNewPassword, userId]);

        return true;
    }

    // Get user status
    static async getUserStatus(userId) {
        const sql = 'SELECT status, status_message FROM users WHERE id = ?';
        const results = await query(sql, [userId]);
        return results[0];
    }

    // Update user status
    static async updateUserStatus(userId, status, statusMessage = null) {
        const sql = 'UPDATE users SET status = ?, status_message = ? WHERE id = ?';
        await query(sql, [status, statusMessage, userId]);
        return this.getUserStatus(userId);
    }
}

module.exports = UserModel;
