const express = require('express');
const db = require('../config/db');
const authenticateJWT = require('../middleware/authenticateJWT');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();

// Add New Location (Admin Only)
router.post('/', authenticateJWT,  (req, res) => {
    const { location_name, city, sport, price_per_3_hours } = req.body;
    const admin_id = req.user.user_id;
    const query = `INSERT INTO Locations (admin_id, location_name, city, sport, price_per_3_hours) VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [admin_id, location_name, city, sport, price_per_3_hours], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to create location' });
        return res.json({ message: 'Location created successfully', location_id: result.insertId });
    });
});

// Update Location (Admin Only)
router.put('/:id', authenticateJWT, requireAdmin, (req, res) => {
    const { location_name, city, sport, price_per_3_hours } = req.body;
    const location_id = req.params.id;
    const query = `UPDATE Locations SET location_name = ?, city = ?, sport = ?, price_per_3_hours = ? WHERE location_id = ? AND admin_id = ?`;

    db.query(query, [location_name, city, sport, price_per_3_hours, location_id, req.user.user_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update location' });
        return res.json({ message: 'Location updated successfully' });
    });
});

// Delete Location (Admin Only)
router.delete('/:id', authenticateJWT, requireAdmin, (req, res) => {
    const location_id = req.params.id;

    // Delete location and associated bookings
    const deleteBookingsQuery = `DELETE FROM Bookings WHERE location_id = ?`;
    const deleteLocationQuery = `DELETE FROM Locations WHERE location_id = ? AND admin_id = ?`;

    db.query(deleteBookingsQuery, [location_id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete associated bookings' });

        db.query(deleteLocationQuery, [location_id, req.user.user_id], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete location' });
            return res.json({ message: 'Location and associated bookings deleted successfully' });
        });
    });
});

// Get Details of a Specific Location (Any User)
router.get('/:id', authenticateJWT, (req, res) => {
    const location_id = req.params.id;
    const query = `SELECT location_id, location_name, city, sport, price_per_3_hours,max_capacity FROM Locations WHERE location_id = ?`;

    db.query(query, [location_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve location details' });
        if (results.length === 0) return res.status(404).json({ message: 'No results available' });
        return res.json(results[0]);
    });
});


module.exports = router;
