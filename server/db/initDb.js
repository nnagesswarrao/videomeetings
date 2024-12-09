const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    try {
        // Create connection without database selected
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD
        });

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        // Split schema into individual statements and execute them using query instead of execute
        const statements = schema.split(';').filter(statement => statement.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if this file is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = initializeDatabase;
