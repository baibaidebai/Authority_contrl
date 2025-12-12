require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  // Use localhost/127.0.0.1 when running on the same server to avoid firewall/NAT loopback issues
  host: '127.0.0.1', 
  user: 'Authority_Ctler$123',
  password: 'Authority_Ctler$123',
  database: 'Authority_Contrl_Developer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.code, err.message);
  } else {
    console.log('Successfully connected to database at 127.0.0.1');
    connection.release();
  }
});

module.exports = pool.promise();