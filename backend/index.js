require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
});

// Route to fetch all events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events'); 
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Route to fetch all locations
app.get('/api/locations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM locations');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Route to fetch events by location ID
app.get('/api/locations/:id/events', async (req, res) => {
    const locationId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM events WHERE location_id = $1', [locationId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
