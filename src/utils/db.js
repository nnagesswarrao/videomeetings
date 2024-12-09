const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'video_meeting_app',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
};

console.log('Database Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    password: dbConfig.password ? '***' : 'NOT PROVIDED'
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Query function to execute SQL statements
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', {
            message: error.message,
            sqlState: error.sqlState,
            code: error.code,
            sql: sql,
            params: params
        });
        throw error;
    }
}

// Function to get a connection from the pool
async function getConnection() {
    return await pool.getConnection();
}

module.exports = {
    query,
    getConnection,
    pool
};
