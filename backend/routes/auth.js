const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    const { username, password, email, user_role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO Users (username, password, email, user_role) VALUES (?, ?, ?, ?)`;
        
        db.query(query, [username, hashedPassword, email, user_role], (err, result) => {
            if (err) {
                console.error("Database error during registration:", err.message); // Log database error
                return res.status(500).json({ error: 'Registration failed' });
            }
            console.log("User registered successfully:", { user_id: result.insertId });
            res.json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error("Error in registration:", error.message); // Log any errors during hashing
        res.status(500).json({ error: 'Error processing registration' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password, user_role } = req.body;

    const query = `SELECT * FROM Users WHERE username = ? AND user_role = ?`;
    db.query(query, [username, user_role], async (err, results) => {
        if (err) {
            console.error("Database error during login:", err.message); // Log database error
            return res.status(500).json({ message: 'Login failed due to database error' });
        }
        
        if (results.length === 0) {
            console.warn("No user found with the specified role:", user_role);
            return res.status(401).json({ message: `${user_role} does not exist` });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            try {
                const token = jwt.sign(
                    { user_id: user.user_id, user_role: user.user_role }, 
                    process.env.JWT_SECRET || 'your_jwt_secret_key', 
                    { expiresIn: '1h' }
                );
                console.log("Login successful:", { user_id: user.user_id, role: user.user_role });
                res.json({ token, user_role: user.user_role });
            } catch (tokenError) {
                console.error("Error signing JWT:", tokenError.message);
                res.status(500).json({ message: 'Token generation failed' });
            }
        } else {
            console.warn("Password mismatch for user:", username);
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

module.exports = router;
