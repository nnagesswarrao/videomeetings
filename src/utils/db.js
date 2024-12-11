const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Ensure this is set
    database: process.env.DB_NAME || 'video_meeting',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true  // Enable multiple statements
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

// Initialize database and tables
async function initializeDatabase() {
    try {
        // Create database if not exists using a direct connection
        const tempPool = mysql.createPool({
            ...dbConfig,
            database: undefined  // Remove database from config temporarily
        });
        
        await tempPool.query('CREATE DATABASE IF NOT EXISTS video_meeting');
        await tempPool.end();  // Close temporary connection
        
        // Create users table first (for foreign key)
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create teams table (for foreign key)
        await query(`
            CREATE TABLE IF NOT EXISTS teams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create channels table (for foreign key)
        await query(`
            CREATE TABLE IF NOT EXISTS channels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                team_id INT,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
            )
        `);

        // Create meetings table with all required columns
        await query(`
            CREATE TABLE IF NOT EXISTS meetings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                meeting_id VARCHAR(100) NOT NULL UNIQUE,
                host_id INT NOT NULL,
                team_id INT,
                channel_id INT,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                meeting_type ENUM('instant', 'scheduled', 'channel', 'webinar') DEFAULT 'instant',
                start_time TIMESTAMP NULL,
                end_time TIMESTAMP NULL,
                recurrence_pattern VARCHAR(100),
                time_zone VARCHAR(50),
                status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
                password VARCHAR(100),
                max_participants INT DEFAULT 100,
                recording_enabled BOOLEAN DEFAULT false,
                transcription_enabled BOOLEAN DEFAULT false,
                chat_enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (host_id) REFERENCES users(id),
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
                FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL
            )
        `);

        // Insert a default user for testing if not exists
        await query(`
            INSERT IGNORE INTO users (id, email, name) 
            VALUES (1, 'test@example.com', 'Test User')
        `);

        console.log('Database and tables initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Call initialization on module import
initializeDatabase();

module.exports = {
    query,
    getConnection,
    initializeDatabase
};
