import { Pool } from 'pg';

export class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL, // Your Neon connection string
      ssl: { rejectUnauthorized: false } // Required for Neon
    });

    console.log('✅ Connected to Neon PostgreSQL');
    this.init();
  }

  async init() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS locations (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS complaints (
          id TEXT PRIMARY KEY,
          student_name TEXT,
          email TEXT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          location TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add the other tables here (images, comments, support) as you had in SQLite...

      await client.query('COMMIT');
      console.log('✅ Tables created successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Error initializing database:', err);
    } finally {
      client.release();
    }
  }

  async getCategories() {
    const result = await this.pool.query('SELECT name FROM categories ORDER BY name');
    return result.rows.map(row => row.name);
  }

  async addCategory(name) {
    try {
      await this.pool.query('INSERT INTO categories (name) VALUES ($1)', [name]);
      return true;
    } catch (err) {
      if (err.code === '23505') return false; // Unique violation
      throw err;
    }
  }

  async deleteCategory(name) {
    const result = await this.pool.query('DELETE FROM categories WHERE name = $1', [name]);
    return result.rowCount > 0;
  }

  // Add other methods (getComplaints, addComplaint, etc.) similarly using async/await
}
