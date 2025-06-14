import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const db = new Database(path.join(__dirname, 'campuz.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDatabase = () => {
  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Locations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      student_name TEXT,
      email TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'pending',
      support_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      image_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
    )
  `);

  // Support table (for tracking user support/votes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS support (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      user_identifier TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(complaint_id, user_identifier),
      FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
    )
  `);

  // Insert default categories
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  const defaultCategories = ['Campus', 'Hostel', 'Roadways', 'Transport/Bus', 'Others'];
  defaultCategories.forEach(category => insertCategory.run(category));

  // Insert default locations
  const insertLocation = db.prepare('INSERT OR IGNORE INTO locations (name) VALUES (?)');
  const defaultLocations = [
    'Main Campus', 'Hostel A', 'Hostel B', 'Hostel C', 'Block A', 'Block B', 'Block C',
    'Library', 'Cafeteria', 'Sports Complex', 'Auditorium', 'Parking Area', 'Main Gate', 'Administrative Block'
  ];
  defaultLocations.forEach(location => insertLocation.run(location));

  console.log('Database initialized successfully');
};

// Database operations
export const dbOperations = {
  // Categories
  getCategories: () => {
    const stmt = db.prepare('SELECT name FROM categories ORDER BY name');
    return stmt.all().map(row => row.name);
  },

  addCategory: (name) => {
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    try {
      stmt.run(name);
      return true;
    } catch (error) {
      return false;
    }
  },

  deleteCategory: (name) => {
    const stmt = db.prepare('DELETE FROM categories WHERE name = ?');
    return stmt.run(name).changes > 0;
  },

  // Locations
  getLocations: () => {
    const stmt = db.prepare('SELECT name FROM locations ORDER BY name');
    return stmt.all().map(row => row.name);
  },

  addLocation: (name) => {
    const stmt = db.prepare('INSERT INTO locations (name) VALUES (?)');
    try {
      stmt.run(name);
      return true;
    } catch (error) {
      return false;
    }
  },

  deleteLocation: (name) => {
    const stmt = db.prepare('DELETE FROM locations WHERE name = ?');
    return stmt.run(name).changes > 0;
  },

  // Complaints
  getComplaints: () => {
    const stmt = db.prepare(`
      SELECT c.*, 
             GROUP_CONCAT(i.image_data) as images,
             COUNT(DISTINCT s.id) as support_count
      FROM complaints c
      LEFT JOIN images i ON c.id = i.complaint_id
      LEFT JOIN support s ON c.id = s.complaint_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    const complaints = stmt.all().map(complaint => ({
      ...complaint,
      images: complaint.images ? complaint.images.split(',') : [],
      supportCount: complaint.support_count || 0,
      submittedAt: complaint.created_at,
      studentName: complaint.student_name
    }));

    // Get comments for each complaint
    const getComments = db.prepare(`
      SELECT id, name, text, created_at as timestamp
      FROM comments 
      WHERE complaint_id = ? 
      ORDER BY created_at DESC
    `);

    complaints.forEach(complaint => {
      complaint.comments = getComments.all(complaint.id);
    });

    return complaints;
  },

  addComplaint: (complaint) => {
    const transaction = db.transaction(() => {
      // Insert complaint
      const insertComplaint = db.prepare(`
        INSERT INTO complaints (id, student_name, email, title, description, category, location)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertComplaint.run(
        complaint.id,
        complaint.studentName || null,
        complaint.email || null,
        complaint.title,
        complaint.description,
        complaint.category,
        complaint.location || null
      );

      // Insert images if any
      if (complaint.images && complaint.images.length > 0) {
        const insertImage = db.prepare('INSERT INTO images (complaint_id, image_data) VALUES (?, ?)');
        complaint.images.forEach(image => {
          insertImage.run(complaint.id, image);
        });
      }
    });

    transaction();
    return complaint.id;
  },

  updateComplaintStatus: (id, status) => {
    const stmt = db.prepare('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(status, id).changes > 0;
  },

  deleteComplaint: (id) => {
    const stmt = db.prepare('DELETE FROM complaints WHERE id = ?');
    return stmt.run(id).changes > 0;
  },

  // Support/Upvote
  toggleSupport: (complaintId, userIdentifier) => {
    const transaction = db.transaction(() => {
      // Check if user already supported
      const checkSupport = db.prepare('SELECT id FROM support WHERE complaint_id = ? AND user_identifier = ?');
      const existingSupport = checkSupport.get(complaintId, userIdentifier);

      if (existingSupport) {
        // Remove support
        const removeSupport = db.prepare('DELETE FROM support WHERE complaint_id = ? AND user_identifier = ?');
        removeSupport.run(complaintId, userIdentifier);
        return false;
      } else {
        // Add support
        const addSupport = db.prepare('INSERT INTO support (complaint_id, user_identifier) VALUES (?, ?)');
        addSupport.run(complaintId, userIdentifier);
        return true;
      }
    });

    return transaction();
  },

  hasUserSupported: (complaintId, userIdentifier) => {
    const stmt = db.prepare('SELECT id FROM support WHERE complaint_id = ? AND user_identifier = ?');
    return !!stmt.get(complaintId, userIdentifier);
  },

  getSupportCount: (complaintId) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM support WHERE complaint_id = ?');
    return stmt.get(complaintId).count;
  },

  // Comments
  addComment: (comment) => {
    const stmt = db.prepare(`
      INSERT INTO comments (id, complaint_id, name, text)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(comment.id, comment.complaintId, comment.name, comment.text);
    return comment.id;
  },

  // Statistics
  getStats: () => {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM complaints');
    const pendingStmt = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE status = "pending"');
    const resolvedStmt = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE status = "resolved"');
    
    const categoryStmt = db.prepare(`
      SELECT c.name as category, COUNT(co.id) as count 
      FROM categories c 
      LEFT JOIN complaints co ON c.name = co.category 
      GROUP BY c.name
    `);
    
    const locationStmt = db.prepare(`
      SELECT l.name as location, COUNT(co.id) as count 
      FROM locations l 
      LEFT JOIN complaints co ON l.name = co.location 
      GROUP BY l.name
    `);

    const total = totalStmt.get().count;
    const pending = pendingStmt.get().count;
    const resolved = resolvedStmt.get().count;
    
    const byCategory = {};
    categoryStmt.all().forEach(row => {
      byCategory[row.category] = row.count;
    });
    
    const byLocation = {};
    locationStmt.all().forEach(row => {
      byLocation[row.location] = row.count;
    });

    return { total, pending, resolved, byCategory, byLocation };
  }
};

// Initialize database on startup
initDatabase();

export default db;