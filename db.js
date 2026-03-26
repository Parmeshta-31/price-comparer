// db.js
import pg from 'pg';
import dotenv from 'dotenv';

// configuring dotenv to access DATABASE_URL
dotenv.config();

const { Pool } = pg;

// connecting to the database
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon requires this setting for secure connections
});

// create the table if it doesn't exist
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
        console.log("PostgreSQL Connected & Table Ready!");
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }
}