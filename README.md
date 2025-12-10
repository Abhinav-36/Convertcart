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

**Option 1: Automated setup (Recommended - No MySQL CLI needed)**

The seed script will automatically create the database and tables. Just run:

```bash
npm run seed
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Populate with sample data

**Option 2: Manual setup using MySQL CLI**

If you have MySQL command line client in your PATH:

**For Windows PowerShell:**
```powershell
# If MySQL is in PATH
Get-Content database/schema.sql | mysql -u root -p

# Or using cmd.exe
cmd /c "mysql -u root -p < database/schema.sql"

# Or using Git Bash/WSL (if installed)
# In Git Bash: mysql -u root -p < database/schema.sql
```

**For Linux/Mac (Bash):**
```bash
mysql -u root -p < database/schema.sql
```

**Option 3: Using MySQL GUI tools (If MySQL CLI is not in PATH)**

If you get "mysql is not recognized", you can:

1. **Add MySQL to PATH:**
   - Find your MySQL installation (usually `C:\Program Files\MySQL\MySQL Server X.X\bin`)
   - Add it to your system PATH environment variable
   - Restart PowerShell

2. **Use a GUI tool:**
   - **MySQL Workbench**: Open `database/schema.sql` and execute it
   - **phpMyAdmin**: Import `database/schema.sql`
   - **DBeaver/HeidiSQL**: Connect and run the SQL file
   - **VS Code MySQL extension**: Connect and execute the file

3. **Or just use Option 1** - The seed script handles everything automatically!

### 5. Seed the database

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- 10 restaurants across different cities
- Multiple menu items for each restaurant
- Sample orders for various dishes

### 6. Start the server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

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
# Health check
curl http://localhost:3000/health

# Search for biryani dishes between 150-300
curl "http://localhost:3000/search/dishes?name=biryani&minPrice=150&maxPrice=300"
```

## Notes

- The search supports partial matching (e.g., searching "biryani" will match "Chicken Biryani", "Mutton Biryani", etc.)
- Results are sorted by order count in descending order
- Only restaurants with dishes matching the price range are included
- Maximum 10 results are returned

## Deployment on Render

### Step 1: Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect it's a Node.js app

### Step 2: Configure Build Settings

- **Name**: `restaurant-search-api` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or choose a paid plan)

### Step 3: Set Up MySQL Database

1. In Render Dashboard, click "New +" and select "PostgreSQL" (or MySQL if available)
2. Choose "MySQL" if the option is available, otherwise use PostgreSQL and adjust connection
3. Note down the connection details:
   - Internal Database URL
   - Host
   - Port
   - Database name
   - Username
   - Password

**Note**: If Render doesn't offer MySQL directly, you can:
- Use an external MySQL service (like [PlanetScale](https://planetscale.com/), [Aiven](https://aiven.io/), or [Railway](https://railway.app/))
- Or use Render's PostgreSQL and update the code to use PostgreSQL

### Step 4: Configure Environment Variables

In your Web Service settings, add these environment variables:

```
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
NODE_ENV=production
PORT=10000
```

**Important**: Render automatically sets `PORT`, but you can override it. The app will use `process.env.PORT` automatically.

### Step 5: Deploy and Seed Database

1. Click "Create Web Service" to start deployment
2. Once deployed, you can seed the database by:
   - **Option A**: SSH into the service and run `npm run seed`
   - **Option B**: Add a one-time script that runs on first deploy
   - **Option C**: Use Render's Shell to run the seed command

### Step 6: Access Your API

Once deployed, your API will be available at:
```
https://your-service-name.onrender.com
```

Test endpoints:
- Health: `https://your-service-name.onrender.com/health`
- Search: `https://your-service-name.onrender.com/search/dishes?name=biryani&minPrice=150&maxPrice=300`

### Alternative: Using render.yaml

If you prefer configuration as code, the project includes a `render.yaml` file. You can:

1. Push your code to GitHub
2. In Render, select "New +" → "Blueprint"
3. Connect your repository
4. Render will use the `render.yaml` configuration automatically

### Troubleshooting

- **Database connection issues**: Make sure your MySQL database allows connections from Render's IP addresses
- **Port issues**: Render sets PORT automatically, don't hardcode it
- **Build failures**: Check build logs in Render dashboard
- **Seed script**: Run it manually via Render Shell after first deployment

### Other Platforms

**Railway**: Similar process, add MySQL service and set environment variables
**Heroku**: Add ClearDB or JawsDB MySQL addon, set config vars
**Vercel**: Use serverless functions (requires code adjustments)

## License

ISC

