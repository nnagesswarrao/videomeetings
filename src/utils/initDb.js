const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env file
dotenv.config({ 
    path: path.resolve(__dirname, '../../.env') 
});


const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'video_meeting'
};

async function initializeDatabase() {
    let connection;
    try {
        console.log('Attempting to connect with config:', {
            host: dbConfig.host,
            user: dbConfig.user,
            database: dbConfig.database,
            passwordProvided: !!dbConfig.password
        });

        // Create connection
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        console.log('Connection established successfully');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`Database ${dbConfig.database} ensured to exist`);

        // Use the database
        await connection.query(`USE \`${dbConfig.database}\``);

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                job_title VARCHAR(100),
                department VARCHAR(100),
                profile_picture VARCHAR(255),
                status ENUM('online', 'offline', 'away', 'do_not_disturb') DEFAULT 'offline',
                status_message VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully');

        // Read and execute additional schema files if needed
        const schemaPath = path.join(__dirname, 'schema.sql');
        try {
            const schema = await fs.readFile(schemaPath, 'utf8');
            const statements = schema.split(';').filter(statement => statement.trim() !== '');
            
            for (const statement of statements) {
                try {
                    await connection.query(statement);
                } catch (tableError) {
                    console.warn(`Could not execute schema statement: ${tableError.message}`);
                }
            }
        } catch (schemaError) {
            console.warn('Could not read schema file:', schemaError.message);
        }

        console.log('Database initialized successfully');
        await connection.end();
    } catch (error) {
        console.error('Detailed Error:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            stack: error.stack
        });

        // Additional diagnostic information
        console.log('Environment Variables:', {
            DB_HOST: process.env.DB_HOST,
            DB_USER: process.env.DB_USER,
            DB_NAME: process.env.DB_NAME,
            DB_PASSWORD_PROVIDED: !!process.env.DB_PASSWORD
        });

        throw error;
    }
}

// Run initialization if this file is directly executed
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Initialization failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase;
