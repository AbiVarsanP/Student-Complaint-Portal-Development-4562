import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

// Load environment variables
dotenv.config();

export class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.init();
  }

  // Initialize database tables
  async init() {
    try {
      const client = await this.pool.connect();
      
      console.log('✅ Connected to Neon PostgreSQL database');

      // Create tables
      await this.createTables(client);
      
      // Insert default data
      await this.insertDefaults(client);
      
      client.release();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  async createTables(client) {
    const queries = [
      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Locations table
      `CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Complaints table
      `CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(36) PRIMARY KEY,
        student_name VARCHAR(255),
        email VARCHAR(255),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Images table
      `CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        complaint_id VARCHAR(36) NOT NULL,
        image_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
      )`,
      
      // Comments table
      `CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY,
        complaint_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
      )`,
      
      // Support table
      `CREATE TABLE IF NOT EXISTS support (
        id SERIAL PRIMARY KEY,
        complaint_id VARCHAR(36) NOT NULL,
        user_identifier VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(complaint_id, user_identifier),
        FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
      )`
    ];

    for (const query of queries) {
      await client.query(query);
    }
  }

  async insertDefaults(client) {
    // Default categories
    const defaultCategories = ['Campus', 'Hostel', 'Roadways', 'Transport/Bus', 'Others'];
    for (const category of defaultCategories) {
      await client.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [category]
      );
    }

    // Default locations
    const defaultLocations = [
      'Main Campus', 'Hostel A', 'Hostel B', 'Hostel C', 'Block A', 'Block B', 'Block C',
      'Library', 'Cafeteria', 'Sports Complex', 'Auditorium', 'Parking Area', 'Main Gate', 'Administrative Block'
    ];
    for (const location of defaultLocations) {
      await client.query(
        'INSERT INTO locations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [location]
      );
    }
  }

  // Categories
  async getCategories() {
    try {
      const result = await this.pool.query('SELECT name FROM categories ORDER BY name');
      return result.rows.map(row => row.name);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async addCategory(name) {
    try {
      await this.pool.query('INSERT INTO categories (name) VALUES ($1)', [name]);
      return true;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return false;
      }
      throw error;
    }
  }

  async deleteCategory(name) {
    try {
      const result = await this.pool.query('DELETE FROM categories WHERE name = $1', [name]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Locations
  async getLocations() {
    try {
      const result = await this.pool.query('SELECT name FROM locations ORDER BY name');
      return result.rows.map(row => row.name);
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }

  async addLocation(name) {
    try {
      await this.pool.query('INSERT INTO locations (name) VALUES ($1)', [name]);
      return true;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return false;
      }
      throw error;
    }
  }

  async deleteLocation(name) {
    try {
      const result = await this.pool.query('DELETE FROM locations WHERE name = $1', [name]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  // Complaints
  async getComplaints() {
    try {
      const complaintsQuery = `
        SELECT 
          c.*,
          string_agg(DISTINCT i.image_data, ',') as images,
          COUNT(DISTINCT s.id) as support_count
        FROM complaints c
        LEFT JOIN images i ON c.id = i.complaint_id
        LEFT JOIN support s ON c.id = s.complaint_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;

      const result = await this.pool.query(complaintsQuery);
      
      const complaints = result.rows.map(row => ({
        id: row.id,
        studentName: row.student_name,
        email: row.email,
        title: row.title,
        description: row.description,
        category: row.category,
        location: row.location,
        status: row.status,
        submittedAt: row.created_at,
        updatedAt: row.updated_at,
        images: row.images ? row.images.split(',') : [],
        supportCount: parseInt(row.support_count) || 0,
        comments: []
      }));

      // Get comments for each complaint
      for (const complaint of complaints) {
        const commentsResult = await this.pool.query(
          'SELECT id, name, text, created_at as timestamp FROM comments WHERE complaint_id = $1 ORDER BY created_at DESC',
          [complaint.id]
        );
        complaint.comments = commentsResult.rows;
      }

      return complaints;
    } catch (error) {
      console.error('Error getting complaints:', error);
      throw error;
    }
  }

  async addComplaint(complaint) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert complaint
      await client.query(
        `INSERT INTO complaints (id, student_name, email, title, description, category, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          complaint.id,
          complaint.studentName || null,
          complaint.email || null,
          complaint.title,
          complaint.description,
          complaint.category,
          complaint.location || null
        ]
      );

      // Insert images if any
      if (complaint.images && complaint.images.length > 0) {
        for (const image of complaint.images) {
          await client.query(
            'INSERT INTO images (complaint_id, image_data) VALUES ($1, $2)',
            [complaint.id, image]
          );
        }
      }

      await client.query('COMMIT');
      return complaint.id;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding complaint:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateComplaintStatus(id, status) {
    try {
      const result = await this.pool.query(
        'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }

  async deleteComplaint(id) {
    try {
      const result = await this.pool.query('DELETE FROM complaints WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  }

  // Support/Upvote
  async toggleSupport(complaintId, userIdentifier) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user already supported
      const existingSupport = await client.query(
        'SELECT id FROM support WHERE complaint_id = $1 AND user_identifier = $2',
        [complaintId, userIdentifier]
      );

      if (existingSupport.rows.length > 0) {
        // Remove support
        await client.query(
          'DELETE FROM support WHERE complaint_id = $1 AND user_identifier = $2',
          [complaintId, userIdentifier]
        );
        await client.query('COMMIT');
        return false;
      } else {
        // Add support
        await client.query(
          'INSERT INTO support (complaint_id, user_identifier) VALUES ($1, $2)',
          [complaintId, userIdentifier]
        );
        await client.query('COMMIT');
        return true;
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error toggling support:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async hasUserSupported(complaintId, userIdentifier) {
    try {
      const result = await this.pool.query(
        'SELECT id FROM support WHERE complaint_id = $1 AND user_identifier = $2',
        [complaintId, userIdentifier]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking user support:', error);
      throw error;
    }
  }

  async getSupportCount(complaintId) {
    try {
      const result = await this.pool.query(
        'SELECT COUNT(*) as count FROM support WHERE complaint_id = $1',
        [complaintId]
      );
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('Error getting support count:', error);
      throw error;
    }
  }

  // Comments
  async addComment(comment) {
    try {
      await this.pool.query(
        `INSERT INTO comments (id, complaint_id, name, text)
         VALUES ($1, $2, $3, $4)`,
        [comment.id, comment.complaintId, comment.name, comment.text]
      );
      return comment.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Statistics
  async getStats() {
    try {
      const totalResult = await this.pool.query('SELECT COUNT(*) as count FROM complaints');
      const pendingResult = await this.pool.query('SELECT COUNT(*) as count FROM complaints WHERE status = $1', ['pending']);
      const resolvedResult = await this.pool.query('SELECT COUNT(*) as count FROM complaints WHERE status = $1', ['resolved']);
      
      const categoryResult = await this.pool.query(`
        SELECT c.name as category, COUNT(co.id) as count 
        FROM categories c 
        LEFT JOIN complaints co ON c.name = co.category 
        GROUP BY c.name
      `);
      
      const locationResult = await this.pool.query(`
        SELECT l.name as location, COUNT(co.id) as count 
        FROM locations l 
        LEFT JOIN complaints co ON l.name = co.location 
        GROUP BY l.name
      `);

      const total = parseInt(totalResult.rows[0].count) || 0;
      const pending = parseInt(pendingResult.rows[0].count) || 0;
      const resolved = parseInt(resolvedResult.rows[0].count) || 0;
      
      const byCategory = {};
      categoryResult.rows.forEach(row => {
        byCategory[row.category] = parseInt(row.count) || 0;
      });
      
      const byLocation = {};
      locationResult.rows.forEach(row => {
        byLocation[row.location] = parseInt(row.count) || 0;
      });

      return { total, pending, resolved, byCategory, byLocation };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Close database connection
  async close() {
    try {
      await this.pool.end();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}