const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env file
dotenv.config({ 
    path: path.resolve(__dirname, '../../.env') 
});

async function testConnection() {
    console.log('Attempting connection with:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD ? '***' : 'NO PASSWORD'
    });

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Database connection successful!');
        console.log('Connection details:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });

        await connection.end();
    } catch (error) {
        console.error('Database connection failed:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            stack: error.stack
        });

        // Print out environment variables for debugging
        console.log('Environment Variables:', {
            DB_HOST: process.env.DB_HOST,
            DB_USER: process.env.DB_USER,
            DB_NAME: process.env.DB_NAME,
            DB_PASSWORD_PROVIDED: !!process.env.DB_PASSWORD
        });
    }
}

testConnection();
