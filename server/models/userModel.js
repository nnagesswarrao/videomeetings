const { query } = require('../db/db.util');
const bcrypt = require('bcrypt');

class UserModel {
    static async create(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        return await query(sql, [username, email, hashedPassword]);
    }

    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        return results[0];
    }

    static async findById(id) {
        const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0];
    }
}

module.exports = UserModel;
