const express = require('express');
const db = require('../config/db');
const authenticateJWT = require('../middleware/authenticateJWT');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();

// Add New Location (Admin Only)
router.post('/locations', authenticateJWT, (req, res) => {
    const { location_name, city, sport, price_per_3_hours, max_capacity } = req.body;
    const user_id = req.user.user_id;
    const getAdminIdQuery = `SELECT admin_id FROM admins WHERE user_id = ?`;

    db.query(getAdminIdQuery, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve admin ID' });
        
        if (results.length === 0) return res.status(404).json({ error: 'Admin not found for this user' });
        
        const admin_id = results[0].admin_id;
        const insertLocationQuery = `
            INSERT INTO Locations (admin_id, location_name, city, sport, price_per_3_hours, max_capacity) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.query(insertLocationQuery, [admin_id, location_name, city, sport, price_per_3_hours, max_capacity], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to create location' });
            res.json({ message: 'Location created successfully', location_id: result.insertId });
        });
    });
});


// Update Only Price per 3 Hours (Admin Only)
router.put('/locations/:id', authenticateJWT, (req, res) => {
    const { price_per_3_hours } = req.body;
    const location_id = req.params.id;
    const user_id = req.user.user_id;

    // Get admin_id associated with the user_id
    const getAdminIdQuery = `SELECT admin_id FROM admins WHERE user_id = ?`;

    db.query(getAdminIdQuery, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve admin ID' });
        if (results.length === 0) return res.status(404).json({ error: 'Admin not found for this user' });

        const admin_id = results[0].admin_id;
        
        // Update location with the new price if admin_id matches
        const query = `UPDATE Locations SET price_per_3_hours = ? WHERE location_id = ? AND admin_id = ?`;

        db.query(query, [price_per_3_hours, location_id, admin_id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to update location price' });
            res.json({ message: 'Location price updated successfully' });
        });
    });
});


// Delete Location and Associated Bookings (Admin Only)
router.delete('/locations/:id', authenticateJWT, (req, res) => {
    const location_id = req.params.id;
    const user_id = req.user.user_id;

    // Query to get admin_id from admins table using user_id
    const getAdminIdQuery = `SELECT admin_id FROM admins WHERE user_id = ?`;

    db.query(getAdminIdQuery, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve admin ID' });
        
        if (results.length === 0) return res.status(404).json({ error: 'Admin not found for this user' });
        
        const admin_id = results[0].admin_id;

    const deleteBookingsQuery = `DELETE FROM Bookings WHERE location_id = ?`;
    const deleteLocationQuery = `DELETE FROM Locations WHERE location_id = ? AND admin_id = ?`;

    db.query(deleteBookingsQuery, [location_id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete associated bookings' });

        db.query(deleteLocationQuery, [location_id, admin_id], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete location' });
            res.json({ message: 'Location and associated bookings deleted successfully' });
        });
    });
});
});

// View All Bookings for Admin's Locations (Admin Only)
router.get('/bookings', authenticateJWT, (req, res) => {
    const user_id = req.user.user_id; // Retrieve user_id from authenticated JWT

    const getAdminIdQuery = `SELECT admin_id FROM admins WHERE user_id = ?`;
    
    db.query(getAdminIdQuery, [user_id], (err, results) => {
        if (err) {
            console.error('Error retrieving admin ID:', err);
            return res.status(500).json({ error: 'Failed to retrieve admin ID' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Admin not found for this user' });
        }

        const admin_id = results[0].admin_id;

        // Call the stored procedure with the retrieved admin_id
        db.query(`CALL GetAdminBookings(?)`, [admin_id], (err, results) => {
            if (err) {
                console.error('Error retrieving bookings:', err);
                return res.status(500).json({ error: 'Failed to retrieve bookings' });
            }
            
            const bookings = results[0];
            
            if (bookings.length === 0) {
                return res.status(404).json({ error: 'No bookings yet' });
            }

            res.json(bookings); // Send booking data in the response
        });
    });
});


// Retrieve All Location Details (Admin Only)
router.get('/locations', authenticateJWT, requireAdmin, (req, res) => {
    const admin_id = req.user.user_id;
    const procedureCall = `CALL get_admin_locations_by_user(?)`;

    db.query(procedureCall, [admin_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve locations' });
        
        const locations = results[0];
        res.json(locations);
    });
});

router.get('/total-revenue', authenticateJWT, (req, res) => {
    const user_id = req.user.user_id; // Retrieve user_id from the authenticated token

    const query = `SELECT total_revenue FROM admins WHERE user_id = ?`;
    
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error retrieving total revenue:', err);
            return res.status(500).json({ error: 'Failed to retrieve total revenue' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Admin not found for this user' });
        }

        const totalRevenue = results[0].total_revenue;
        res.json({ totalRevenue }); // Send the total revenue as JSON
    });
});

// View Bookings for a Specific Location (Admin Only)
router.get('/locations/:id/bookings', authenticateJWT, requireAdmin, (req, res) => {
    const locationId = req.params.id;

    // Call the procedure to get booking details for the specific location
    const procedureCall = `CALL get_bookings_by_location(?)`;

    db.query(procedureCall, [locationId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve bookings' });
        
        const bookings = results[0]; // Extracting bookings array from results
        res.json(bookings);
    });
});


module.exports = router;
