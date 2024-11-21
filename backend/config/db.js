const mysql = require('mysql2');

// Database Connection Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',           // Use your MySQL username
    password: 'sugardaddy',  // Use your MySQL password
    database: 'sports_booking'
});

// Connect to Database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = db;
