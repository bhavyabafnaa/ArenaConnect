const express = require('express');
const db = require('../config/db');
const authenticateJWT = require('../middleware/authenticateJWT');
const requireUser = require('../middleware/requireUser');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();

// Import the formatDate utility
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check Slot Availability for a Given Location and Date (User Only)
router.post('/availability', authenticateJWT, requireUser, (req, res) => {
    const { location_id, date } = req.body;
    
    // Use the formatDate function to format the date string
    const formattedDate = formatDate(new Date(date));

    // Log the location_id and formattedDate to the console
    console.log(`Checking availability for location ID: ${location_id}, Date: ${formattedDate}`);

    db.query(`CALL GetUnavailableSlots(?, ?)`, [location_id, formattedDate], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: 'Failed to check availability' });
        }

        // Retrieve available slots
        const availableSlots = result[0][0].available_slots;
        console.log(result[0][0])
        res.json({
            message: 'Slots checked successfully',
            available_slots: availableSlots || [] // Default to an empty array if null
        });
    });
});


// Create a New Booking (User Only)
router.post('/', authenticateJWT, (req, res) => {
    const { location_id, date, slots, location_fee, total_price } = req.body;
    const user_id = req.user.user_id;
    if (Array.isArray(slots)) {
        console.log("Slots before JSON conversion:", slots); // Debugging
    } else {
        console.error("Slots parameter is not an array:", slots);
        return res.status(400).json({ error: "Slots parameter must be an array" });
    }

    const procedureCall = `CALL add_bookings(?, ?, ?, ?, ?, ?, @result_message)`;
    db.query(procedureCall, [user_id, location_id, date, JSON.stringify(slots), location_fee, total_price], (err) => {
        if (err) {
            console.error("Error calling procedure:", err); // Debugging
            return res.status(500).json({ error: 'Failed to create booking' });
        }
        db.query('SELECT @result_message AS message', (err, result) => {
            if (err) {
                console.error("Error retrieving result message:", err); // Debugging
                return res.status(500).json({ error: 'Error retrieving result message' });
            }
            const message = result[0].message;
            console.log("Procedure result message:", message); // Debugging
            if (message.includes("Unavailable slots")) {
                return res.status(400).json({ error: message });
            } else {
                res.json({
                    message: message
                });
            }
        });
    });
});



// Get All Bookings for Admin's Locations (Admin Only)
// router.get('/admin', authenticateJWT, (req, res) => {
//     const admin_id = req.user.user_id;

//     db.query(`CALL get_admin_bookings(?)`, [admin_id], (err, results) => {
//         if (err) return res.status(500).json({ error: 'Failed to retrieve bookings' });
//         res.json(results[0]);
//     });
// });

router.get('/user', authenticateJWT, requireUser, (req, res) => {
    const user_id = req.user.user_id;

    db.query(`CALL get_user_bookings(?)`, [user_id], (err, results) => {
        if (err) {
            console.error("Database error while retrieving user bookings:", err);
            return res.status(500).json({ error: 'Failed to retrieve user bookings' });
        }
        const bookings = results[0] || []; 
        res.json(bookings); 
    });
});

// Get All Bookings for a User (User Only)
// router.get('/user', authenticateJWT, requireUser, (req, res) => {
//     const user_id = req.user.user_id;

//     db.query(`CALL get_user_bookings(?)`, [user_id], (err, results) => {
//         if (err) {
//             console.error("Database error while retrieving user bookings:", err);
//             return res.status(500).json({ error: 'Failed to retrieve user bookings' });
//         }
        
//         const [bookings] = results;
//         if (bookings.length === 0) {
//             return res.json({ message: 'No bookings found for this user.' });
//         }
        
//         res.json(bookings);
//     });
// });

module.exports = router;
