require('dotenv').config();
const mysql = require('mysql2/promise');

// Railway MySQL Configuration
// Railway automatically provides these environment variables:
// - MYSQL_HOST
// - MYSQL_USER
// - MYSQL_PASSWORD
// - MYSQL_DATABASE
// - MYSQL_PORT

const poolConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'restaurant_db',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000,
    timeout: 60000 // 60 seconds
};

const pool = mysql.createPool(poolConfig);

// Test connection on startup (non-blocking)
pool.getConnection()
    .then(connection => {
        console.log('✓ Database connected successfully');
        console.log(`  Host: ${poolConfig.host}`);
        console.log(`  Database: ${poolConfig.database}`);
        connection.release();
    })
    .catch(err => {
        console.error('✗ Database connection error:', err.message);
        console.error('  Please check your Railway MySQL configuration and credentials');
    });

module.exports = pool;
