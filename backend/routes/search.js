const express = require('express');
const db = require('../config/db');
const authenticateJWT = require('../middleware/authenticateJWT');
const router = express.Router();

// Search for locations by name or city
router.get('/search', authenticateJWT, (req, res) => {
    console.log('Request Headers:', req.headers);
    console.log('Decoded User:', req.user);
    
    const { query } = req.query;
    const searchTerm = `%${query}%`;

    const sqlQuery = `
        SELECT * FROM Locations
        WHERE location_name LIKE ? OR city LIKE ?
    `;

    db.query(sqlQuery, [searchTerm, searchTerm], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to search locations' });
        if (results.length === 0) return res.status(404).json({ message: 'No results available' });
        res.json(results);
    });
});


router.get('/filteroptions', authenticateJWT, (req, res) => {
    const cityQuery = `SELECT DISTINCT city FROM Locations`;
    const sportQuery = `SELECT DISTINCT sport FROM Locations`;

    db.query(cityQuery, (err, citiesResult) => {
        if (err) {
            console.error('Error loading cities:', err);
            return res.status(500).json({ message: 'Failed to load cities', error: err });
        }

        db.query(sportQuery, (err, sportsResult) => {
            if (err) {
                console.error('Error loading sports:', err);
                return res.status(500).json({ message: 'Failed to load sports', error: err });
            }

            // Respond with unique cities and sports
            res.json({
                cities: citiesResult.map(row => row.city),
                sports: sportsResult.map(row => row.sport)
            });
        });
    });
});



// Filter locations by selected cities, sports, and price range
router.get('/filters', authenticateJWT, (req, res) => {
    const { cities, sports, min_price, max_price } = req.query;
    
    // Base query selects all locations
    let query = `SELECT * FROM Locations WHERE 1=1`;
    const params = [];

    // Filter by cities if provided, else include all cities
    if (cities) {
        const cityList = cities.split(',');
        query += ` AND city IN (${cityList.map(() => '?').join(',')})`;
        params.push(...cityList);
    }

    // Filter by sports if provided, else include all sports
    if (sports) {
        const sportList = sports.split(',');
        query += ` AND sport IN (${sportList.map(() => '?').join(',')})`;
        params.push(...sportList);
    }

    // Filter by minimum price if provided
    if (min_price) {
        query += ` AND price_per_3_hours >= ?`;
        params.push(min_price);
    }

    // Filter by maximum price if provided
    if (max_price) {
        query += ` AND price_per_3_hours <= ?`;
        params.push(max_price);
    }

    // Execute the query with the parameters
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to filter locations', error: err });
        }
        
        // If no results, send a message stating that there are no results
        if (results.length === 0) {
            return res.json({ message: 'No results available' });
        }
        
        return res.json(results);
    });
});


module.exports = router;
