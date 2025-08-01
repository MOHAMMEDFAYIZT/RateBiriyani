require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from public folder
app.use(express.static('public'));

// Redirect root to login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000 || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100
});
app.use(limiter);

// Email verification middleware
const verifyStudentEmail = (email) => {
    return email.endsWith('@gectcr.ac.in');
};

// ===== UPDATED send-code endpoint =====
app.post('/api/send-code', [
    body('email').isEmail().custom(verifyStudentEmail)
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + process.env.VERIFICATION_CODE_EXPIRY * 60 * 1000);

        // Store in database
        await pool.execute(
            'INSERT INTO users (email, verification_code, code_expires) VALUES (?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE verification_code = ?, code_expires = ?',
            [req.body.email, verificationCode, expiresAt, verificationCode, expiresAt]
        );

        // Return the code to client (for debugging)
        res.json({ 
            code: verificationCode,  // <-- This will appear in browser console
            message: 'Verification code generated'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== verify-code endpoint (unchanged) =====
app.post('/api/verify-code', [
    body('email').isEmail().custom(verifyStudentEmail),
    body('code').isLength({ min: 6, max: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const [users] = await pool.execute(
            'SELECT email FROM users WHERE email = ? AND verification_code = ? AND code_expires > NOW()',
            [req.body.email, req.body.code]
        );

        if (users.length > 0) {
            await pool.execute(
                'UPDATE users SET verified = TRUE WHERE email = ?',
                [req.body.email]
            );
            res.json({ verified: true });
        } else {
            res.status(400).json({ error: 'Invalid or expired code' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== Protected middleware =====
app.use('/api/rate', async (req, res, next) => {
    try {
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE email = ? AND verified = TRUE',
            [req.body.email]
        );

        if (users.length === 0) return res.status(403).json({ error: 'Unverified email' });
        req.userId = users[0].id;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== rate endpoint (unchanged) =====
app.post('/api/rate', [
    body('email').isEmail().custom(verifyStudentEmail),
    body('hotelId').isInt({ min: 1, max: 5 }),
    body('rating').isInt({ min: 1, max: 5 })
], async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    try {
        await pool.execute(
            'INSERT INTO ratings (user_id, hotel_id, rating, rating_date) VALUES (?, ?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE rating = ?',
            [req.userId, req.body.hotelId, req.body.rating, today, req.body.rating]
        );
        res.json({ message: 'Rating submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ===== results endpoint (unchanged) =====
app.get('/api/results', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [results] = await pool.execute(`
            SELECT h.id, h.name, h.image_url, 
                   AVG(r.rating) as average_rating, 
                   COUNT(r.id) as rating_count
            FROM hotels h
            LEFT JOIN ratings r ON h.id = r.hotel_id AND r.rating_date = ?
            GROUP BY h.id
            ORDER BY average_rating DESC
        `, [today]);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});