const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authenticateJWT = require('./middleware/authenticateJWT');
const requireAdmin = require('./middleware/requireAdmin');
const requireUser = require('./middleware/requireUser');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route Definitions
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/search', require('./routes/search'));
app.use('/api/admin', require('./routes/admin'));  // Admin-specific routes

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
