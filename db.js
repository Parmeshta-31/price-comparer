// db.js
import pg from 'pg';
import dotenv from 'dotenv';

// 1. Tell dotenv to put on its X-ray glasses and find the .env file
dotenv.config();

const { Pool } = pg;

// 2. Connect to the Neon database using the hidden URL
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon requires this setting for secure connections
});

// 3. A function to auto-create our table when the server starts
export async function initDB() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS product_cache (
            search_term VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            blinkit_price INTEGER,
            zepto_price INTEGER,
            instamart_price INTEGER,
            image_url TEXT,
            blinkit_link TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    try {
        await pool.query(createTableQuery);
        console.log("✅ PostgreSQL Connected & Table Ready!");
    } catch (err) {
        console.error("❌ Database initialization failed:", err.message);
    }
}