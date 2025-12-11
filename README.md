# Restaurant Search Backend

A simple backend service that allows users to search for restaurants based on a dish name with mandatory price range filtering.

## Features

- Search restaurants by dish name (partial and exact match)
- Filter results by price range (minPrice and maxPrice)
- Returns top 10 restaurants where the dish has been ordered the most
- Each result includes restaurant details, dish name, dish price, and total order count

## Tech Stack

- **Node.js** with Express.js
- **MySQL** with mysql2 driver
- **dotenv** for environment configuration

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd Convertcart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure database

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
PORT=3000
```

### 4. Set up database

The seed script will automatically create the database and tables. Just run:

```bash
npm run seed
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Populate with sample data



### 5. Start the server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

## API Endpoints


### Search Dishes

```
GET /search/dishes?name={dishName}&minPrice={minPrice}&maxPrice={maxPrice}
```

**Parameters:**
- `name` (required): Dish name to search for (supports partial matching)
- `minPrice` (required): Minimum price filter
- `maxPrice` (required): Maximum price filter

**Example Request:**
```
GET /search/dishes?name=biryani&minPrice=150&maxPrice=300
```

**Example Response:**
```json
{
    "restaurants": [
        {
            "restaurantId": 5,
            "restaurantName": "Hyderabadi Spice House",
            "city": "Hyderabad",
            "dishName": "Chicken Biryani",
            "dishPrice": 220,
            "orderCount": 96
        },
        {
            "restaurantId": 10,
            "restaurantName": "Lucknow Legacy",
            "city": "Lucknow",
            "dishName": "Chicken Biryani",
            "dishPrice": 240,
            "orderCount": 88
        }
    ]
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid parameters
- `500 Internal Server Error`: Server error

## Database Schema

### restaurants
- `id` (INT, PRIMARY KEY)
- `name` (VARCHAR)
- `city` (VARCHAR)
- `created_at` (TIMESTAMP)

### menu_items
- `id` (INT, PRIMARY KEY)
- `restaurant_id` (INT, FOREIGN KEY)
- `dish_name` (VARCHAR)
- `price` (DECIMAL)
- `created_at` (TIMESTAMP)

### orders
- `id` (INT, PRIMARY KEY)
- `menu_item_id` (INT, FOREIGN KEY)
- `created_at` (TIMESTAMP)

## Project Structure

```
.
├── config/
│   └── database.js       # MySQL connection pool
├── database/
│   └── schema.sql        # Database schema
├── .env.example          # Environment variables template
├── .gitignore
├── DEPLOY.md             # Quick deployment guide
├── package.json
├── README.md
├── render.yaml           # Render deployment config
├── seed.js               # Database seed script
└── server.js             # Express server and routes
```

## Testing

Test the API using curl or any HTTP client:

```bash

# Search for biryani dishes between 150-300
curl "http://localhost:3000/search/dishes?name=biryani&minPrice=150&maxPrice=300"
```

## Notes

- The search supports partial matching (e.g., searching "biryani" will match "Chicken Biryani", "Mutton Biryani", etc.)
- Results are sorted by order count in descending order
- Only restaurants with dishes matching the price range are included
- Maximum 10 results are returned


### Troubleshooting

- **Database connection issues**: Make sure your MySQL database allows connections from Render's IP addresses
- **Port issues**: Render sets PORT automatically, don't hardcode it
- **Build failures**: Check build logs in Render dashboard
- **Seed script**: Run it manually via Render Shell after first deployment

### Other Platforms

**Railway**: See [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for complete setup guide. Railway automatically provides `MYSQL_*` environment variables - no configuration needed!
**Heroku**: Add ClearDB or JawsDB MySQL addon, set config vars
**Vercel**: Use serverless functions (requires code adjustments)

## License

ISC

