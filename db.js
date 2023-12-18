const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Asit@123',
  database: 'YogaClasses',
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0,
});

// Get a connection from the pool
const getConnection = () => pool.getConnection();

module.exports = { getConnection };
