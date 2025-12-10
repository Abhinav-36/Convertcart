require('dotenv').config();
const express = require('express');
const db = require('./config/database');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Auto-seed function - checks if database is empty and seeds if needed
async function checkAndSeed() {
    try {
        // Check if restaurants table has any data
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM restaurants');
        if (rows[0].count === 0) {
            console.log('Database is empty, running seed automatically...');
            await seedDatabase();
            console.log('Auto-seed completed successfully');
        } else {
            console.log(`Database already has ${rows[0].count} restaurants, skipping seed`);
        }
    } catch (err) {
        // If tables don't exist yet, seed will create them
        if (err.code === 'ER_NO_SUCH_TABLE' || err.code === '42S02') {
            console.log('Tables not found, running seed to create them...');
            try {
                await seedDatabase();
                console.log('Auto-seed completed successfully');
            } catch (seedErr) {
                console.error('Auto-seed failed:', seedErr.message);
                // Don't block server startup if seed fails
            }
        } else {
            console.log('Could not check database status:', err.message);
            console.log('Server will start anyway. Run "npm run seed" manually if needed.');
        }
    }
}

// Simple health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running' 
    });
});

// Main search endpoint
app.get('/search/dishes', async (req, res) => {
    try {
        const name = req.query.name;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        // Check required params
        if (!name || minPrice === undefined || maxPrice === undefined) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'name, minPrice, and maxPrice are required'
            });
        }

        const dishName = name.trim();
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        // Validate numbers
        if (isNaN(min) || isNaN(max)) {
            return res.status(400).json({
                error: 'Invalid price range',
                message: 'minPrice and maxPrice must be valid numbers'
            });
        }

        // Check price logic
        if (min < 0 || max < 0) {
            return res.status(400).json({
                error: 'Invalid price range',
                message: 'Prices must be non-negative'
            });
        }

        if (min > max) {
            return res.status(400).json({
                error: 'Invalid price range',
                message: 'minPrice must be less than or equal to maxPrice'
            });
        }

        // Build the query
        const sql = `
            SELECT 
                r.id AS restaurantId,
                r.name AS restaurantName,
                r.city,
                mi.dish_name AS dishName,
                mi.price AS dishPrice,
                COUNT(o.id) AS orderCount
            FROM restaurants r
            INNER JOIN menu_items mi ON r.id = mi.restaurant_id
            LEFT JOIN orders o ON mi.id = o.menu_item_id
            WHERE mi.dish_name LIKE ? 
                AND mi.price >= ? 
                AND mi.price <= ?
            GROUP BY r.id, r.name, r.city, mi.id, mi.dish_name, mi.price
            ORDER BY orderCount DESC
            LIMIT 10
        `;

        const searchTerm = `%${dishName}%`;
        const [rows] = await db.execute(sql, [searchTerm, min, max]);

        res.json({
            restaurants: rows
        });

    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while searching for dishes'
        });
    }
});

// Start the server
async function startServer() {
    // Check and seed database before starting server
    await checkAndSeed();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Try: http://localhost:${PORT}/search/dishes?name=biryani&minPrice=150&maxPrice=300`);
        }
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
