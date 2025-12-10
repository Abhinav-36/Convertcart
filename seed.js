require('dotenv').config();
const mysql = require('mysql2/promise');

// DB config
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_db'
};

async function seedDatabase() {
    let connection = null;
    
    try {
        // Need to connect without DB first to create it
        const tempConfig = Object.assign({}, dbConfig);
        delete tempConfig.database;
        
        connection = await mysql.createConnection(tempConfig);
        
        // Create DB
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.query(`USE ${dbConfig.database}`);
        
        console.log('Connected to MySQL');
        
        // Setup tables
        const createRestaurantsTable = `
            CREATE TABLE IF NOT EXISTS restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createRestaurantsTable);
        
        const createMenuItemsTable = `
            CREATE TABLE IF NOT EXISTS menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                dish_name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                INDEX idx_restaurant_id (restaurant_id),
                INDEX idx_dish_name (dish_name)
            )
        `;
        await connection.query(createMenuItemsTable);
        
        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                menu_item_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
                INDEX idx_menu_item_id (menu_item_id)
            )
        `;
        await connection.query(createOrdersTable);
        
        console.log('Tables ready');
        
        // Wipe existing data
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE orders');
        await connection.query('TRUNCATE TABLE menu_items');
        await connection.query('TRUNCATE TABLE restaurants');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Old data cleared');
        
        // Restaurant data
        const restaurantData = [
            ['Hyderabadi Spice House', 'Hyderabad'],
            ['Delhi Darbar', 'Delhi'],
            ['Mumbai Masala', 'Mumbai'],
            ['Chennai Curry Point', 'Chennai'],
            ['Bangalore Biryani', 'Bangalore'],
            ['Pune Palace', 'Pune'],
            ['Kolkata Kitchen', 'Kolkata'],
            ['Jaipur Junction', 'Jaipur'],
            ['Ahmedabad Aroma', 'Ahmedabad'],
            ['Lucknow Legacy', 'Lucknow']
        ];
        
        await connection.query(
            'INSERT INTO restaurants (name, city) VALUES ?',
            [restaurantData]
        );
        
        console.log(`Added ${restaurantData.length} restaurants`);
        
        // Menu items - keeping it simple
        const dishes = [
            [1, 'Chicken Biryani', 220],
            [1, 'Mutton Biryani', 280],
            [1, 'Veg Biryani', 150],
            [1, 'Butter Chicken', 250],
            [1, 'Paneer Tikka', 180],
            [2, 'Chicken Biryani', 200],
            [2, 'Chicken Biryani', 240], // premium version
            [2, 'Veg Biryani', 160],
            [2, 'Dal Makhani', 180],
            [2, 'Naan', 50],
            [3, 'Chicken Biryani', 230],
            [3, 'Fish Biryani', 260],
            [3, 'Pav Bhaji', 120],
            [3, 'Vada Pav', 30],
            [3, 'Dosa', 80],
            [4, 'Chicken Biryani', 210],
            [4, 'Egg Biryani', 190],
            [4, 'Idli', 60],
            [4, 'Sambar', 40],
            [4, 'Rasam', 35],
            [5, 'Chicken Biryani', 225],
            [5, 'Mutton Biryani', 290],
            [5, 'Veg Biryani', 155],
            [5, 'Chicken Curry', 200],
            [5, 'Roti', 20],
            [6, 'Chicken Biryani', 215],
            [6, 'Veg Biryani', 145],
            [6, 'Misal Pav', 100],
            [6, 'Bhel Puri', 60],
            [6, 'Puran Poli', 80],
            [7, 'Chicken Biryani', 205],
            [7, 'Fish Biryani', 250],
            [7, 'Rasgulla', 50],
            [7, 'Sandesh', 60],
            [7, 'Kathi Roll', 90],
            [8, 'Chicken Biryani', 235],
            [8, 'Dal Baati', 180],
            [8, 'Gatte Ki Sabzi', 160],
            [8, 'Rajasthani Thali', 300],
            [8, 'Lassi', 40],
            [9, 'Chicken Biryani', 195],
            [9, 'Dhokla', 70],
            [9, 'Gujarati Thali', 250],
            [9, 'Fafda', 50],
            [9, 'Jalebi', 40],
            [10, 'Chicken Biryani', 240],
            [10, 'Mutton Biryani', 300],
            [10, 'Kebabs', 220],
            [10, 'Nihari', 180],
            [10, 'Sheermal', 30]
        ];
        
        await connection.query(
            'INSERT INTO menu_items (restaurant_id, dish_name, price) VALUES ?',
            [dishes]
        );
        
        console.log(`Added ${dishes.length} dishes`);
        
        // Now get all menu items to link orders
        const [menuItemsList] = await connection.query(
            'SELECT id, restaurant_id, dish_name, price FROM menu_items ORDER BY id'
        );
        
        // Build lookup map
        const lookup = {};
        for (let i = 0; i < menuItemsList.length; i++) {
            const item = menuItemsList[i];
            const restId = item.restaurant_id;
            const dish = item.dish_name;
            
            if (!lookup[restId]) {
                lookup[restId] = {};
            }
            if (!lookup[restId][dish]) {
                lookup[restId][dish] = [];
            }
            lookup[restId][dish].push(item);
        }
        
        // Helper to find menu item
        function findMenuItem(restId, dishName, price) {
            const items = lookup[restId] && lookup[restId][dishName] ? lookup[restId][dishName] : [];
            if (price !== null && price !== undefined) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].price == price) {
                        return items[i].id;
                    }
                }
                return null;
            }
            return items.length > 0 ? items[0].id : null;
        }
        
        // Generate order data
        const orderList = [];
        
        function addOrders(itemId, numOrders) {
            if (itemId) {
                for (let j = 0; j < numOrders; j++) {
                    orderList.push([itemId]);
                }
            }
        }
        
        // Chicken Biryani orders across restaurants
        addOrders(findMenuItem(1, 'Chicken Biryani', 220), 96);
        addOrders(findMenuItem(2, 'Chicken Biryani', 200), 85);
        addOrders(findMenuItem(3, 'Chicken Biryani', 230), 72);
        addOrders(findMenuItem(4, 'Chicken Biryani', 210), 68);
        addOrders(findMenuItem(5, 'Chicken Biryani', 225), 91);
        addOrders(findMenuItem(6, 'Chicken Biryani', 215), 55);
        addOrders(findMenuItem(7, 'Chicken Biryani', 205), 63);
        addOrders(findMenuItem(8, 'Chicken Biryani', 235), 78);
        addOrders(findMenuItem(9, 'Chicken Biryani', 195), 45);
        addOrders(findMenuItem(10, 'Chicken Biryani', 240), 88);
        
        // Other biryani types
        addOrders(findMenuItem(1, 'Mutton Biryani', 280), 45);
        addOrders(findMenuItem(5, 'Mutton Biryani', 290), 52);
        addOrders(findMenuItem(10, 'Mutton Biryani', 300), 60);
        addOrders(findMenuItem(3, 'Fish Biryani', 260), 38);
        addOrders(findMenuItem(4, 'Egg Biryani', 190), 42);
        addOrders(findMenuItem(1, 'Veg Biryani', 150), 35);
        addOrders(findMenuItem(2, 'Veg Biryani', 160), 28);
        addOrders(findMenuItem(5, 'Veg Biryani', 155), 31);
        addOrders(findMenuItem(6, 'Veg Biryani', 145), 22);
        
        // Few other popular dishes
        addOrders(findMenuItem(1, 'Butter Chicken', 250), 15);
        addOrders(findMenuItem(1, 'Paneer Tikka', 180), 12);
        addOrders(findMenuItem(2, 'Dal Makhani', 180), 8);
        addOrders(findMenuItem(3, 'Pav Bhaji', 120), 10);
        
        // Insert orders if we have any
        if (orderList.length > 0) {
            await connection.query(
                'INSERT INTO orders (menu_item_id) VALUES ?',
                [orderList]
            );
            console.log(`Added ${orderList.length} orders`);
        }
        
        console.log('Seeding done!');
        
    } catch (err) {
        console.error('Something went wrong:', err);
        throw err;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Export for use in other files
module.exports = { seedDatabase };

// Run it if called directly (not imported)
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('All good!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Failed:', err);
            process.exit(1);
        });
}
