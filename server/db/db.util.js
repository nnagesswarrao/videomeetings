const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'video_meeting',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query
};
