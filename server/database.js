import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Database {
  constructor() {
    this.db = new sqlite3.Database(join(__dirname, 'campuz.db'), (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('✅ Connected to SQLite database');
        this.init();
      }
    });
  }

  // Initialize database tables
  init() {
    const queries = [
      // Enable foreign keys
      `PRAGMA foreign_keys = ON`,
      
      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Locations table
      `CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Complaints table
      `CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        student_name TEXT,
        email TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Images table
      `CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT NOT NULL,
        image_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
      )`,
      
      // Comments table
      `CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        complaint_id TEXT NOT NULL,
        name TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
      )`,
      
      // Support table
      `CREATE TABLE IF NOT EXISTS support (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT NOT NULL,
        user_identifier TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(complaint_id, user_identifier),
        FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE
      )`
    ];

    // Execute all queries
    queries.forEach(query => {
      this.db.run(query, (err) => {
        if (err) console.error('Error executing query:', err);
      });
    });

    // Insert default data
    this.insertDefaults();
  }

  insertDefaults() {
    // Default categories
    const defaultCategories = ['Campus', 'Hostel', 'Roadways', 'Transport/Bus', 'Others'];
    defaultCategories.forEach(category => {
      this.db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [category]);
    });

    // Default locations
    const defaultLocations = [
      'Main Campus', 'Hostel A', 'Hostel B', 'Hostel C', 'Block A', 'Block B', 'Block C',
      'Library', 'Cafeteria', 'Sports Complex', 'Auditorium', 'Parking Area', 'Main Gate', 'Administrative Block'
    ];
    defaultLocations.forEach(location => {
      this.db.run('INSERT OR IGNORE INTO locations (name) VALUES (?)', [location]);
    });
  }

  // Categories
  getCategories() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT name FROM categories ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
  }

  addCategory(name) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') resolve(false);
          else reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  deleteCategory(name) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM categories WHERE name = ?', [name], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // Locations
  getLocations() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT name FROM locations ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
  }

  addLocation(name) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO locations (name) VALUES (?)', [name], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') resolve(false);
          else reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  deleteLocation(name) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM locations WHERE name = ?', [name], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // Complaints
  getComplaints() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          GROUP_CONCAT(i.image_data) as images,
          COUNT(DISTINCT s.id) as support_count
        FROM complaints c
        LEFT JOIN images i ON c.id = i.complaint_id
        LEFT JOIN support s ON c.id = s.complaint_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;

      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const complaints = rows.map(row => ({
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
          supportCount: row.support_count || 0,
          comments: []
        }));

        // Get comments for each complaint
        const commentPromises = complaints.map(complaint => {
          return new Promise((resolveComment, rejectComment) => {
            this.db.all(
              'SELECT id, name, text, created_at as timestamp FROM comments WHERE complaint_id = ? ORDER BY created_at DESC',
              [complaint.id],
              (err, commentRows) => {
                if (err) rejectComment(err);
                else {
                  complaint.comments = commentRows;
                  resolveComment();
                }
              }
            );
          });
        });

        Promise.all(commentPromises)
          .then(() => resolve(complaints))
          .catch(reject);
      });
    });
  }

  addComplaint(complaint) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Insert complaint
        this.db.run(
          `INSERT INTO complaints (id, student_name, email, title, description, category, location)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            complaint.id,
            complaint.studentName || null,
            complaint.email || null,
            complaint.title,
            complaint.description,
            complaint.category,
            complaint.location || null
          ],
          (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }

            // Insert images if any
            if (complaint.images && complaint.images.length > 0) {
              const imagePromises = complaint.images.map(image => {
                return new Promise((resolveImage, rejectImage) => {
                  this.db.run(
                    'INSERT INTO images (complaint_id, image_data) VALUES (?, ?)',
                    [complaint.id, image],
                    (err) => {
                      if (err) rejectImage(err);
                      else resolveImage();
                    }
                  );
                });
              });

              Promise.all(imagePromises)
                .then(() => {
                  this.db.run('COMMIT');
                  resolve(complaint.id);
                })
                .catch((err) => {
                  this.db.run('ROLLBACK');
                  reject(err);
                });
            } else {
              this.db.run('COMMIT');
              resolve(complaint.id);
            }
          }
        );
      });
    });
  }

  updateComplaintStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  }

  deleteComplaint(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM complaints WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // Support/Upvote
  toggleSupport(complaintId, userIdentifier) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Check if user already supported
        this.db.get(
          'SELECT id FROM support WHERE complaint_id = ? AND user_identifier = ?',
          [complaintId, userIdentifier],
          (err, row) => {
            if (err) {
              reject(err);
              return;
            }

            if (row) {
              // Remove support
              this.db.run(
                'DELETE FROM support WHERE complaint_id = ? AND user_identifier = ?',
                [complaintId, userIdentifier],
                (err) => {
                  if (err) reject(err);
                  else resolve(false);
                }
              );
            } else {
              // Add support
              this.db.run(
                'INSERT INTO support (complaint_id, user_identifier) VALUES (?, ?)',
                [complaintId, userIdentifier],
                (err) => {
                  if (err) reject(err);
                  else resolve(true);
                }
              );
            }
          }
        );
      });
    });
  }

  hasUserSupported(complaintId, userIdentifier) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id FROM support WHERE complaint_id = ? AND user_identifier = ?',
        [complaintId, userIdentifier],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }

  getSupportCount(complaintId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM support WHERE complaint_id = ?',
        [complaintId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }

  // Comments
  addComment(comment) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO comments (id, complaint_id, name, text)
         VALUES (?, ?, ?, ?)`,
        [comment.id, comment.complaintId, comment.name, comment.text],
        function(err) {
          if (err) reject(err);
          else resolve(comment.id);
        }
      );
    });
  }

  // Statistics
  getStats() {
    return new Promise((resolve, reject) => {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM complaints',
        pending: 'SELECT COUNT(*) as count FROM complaints WHERE status = "pending"',
        resolved: 'SELECT COUNT(*) as count FROM complaints WHERE status = "resolved"',
        byCategory: `
          SELECT c.name as category, COUNT(co.id) as count 
          FROM categories c 
          LEFT JOIN complaints co ON c.name = co.category 
          GROUP BY c.name
        `,
        byLocation: `
          SELECT l.name as location, COUNT(co.id) as count 
          FROM locations l 
          LEFT JOIN complaints co ON l.name = co.location 
          GROUP BY l.name
        `
      };

      const results = {};
      const queryPromises = Object.entries(queries).map(([key, query]) => {
        return new Promise((resolveQuery, rejectQuery) => {
          if (key === 'byCategory' || key === 'byLocation') {
            this.db.all(query, (err, rows) => {
              if (err) rejectQuery(err);
              else {
                results[key] = {};
                rows.forEach(row => {
                  results[key][row[key.slice(2).toLowerCase()]] = row.count;
                });
                resolveQuery();
              }
            });
          } else {
            this.db.get(query, (err, row) => {
              if (err) rejectQuery(err);
              else {
                results[key] = row.count;
                resolveQuery();
              }
            });
          }
        });
      });

      Promise.all(queryPromises)
        .then(() => resolve(results))
        .catch(reject);
    });
  }

  // Close database connection
  close() {
    this.db.close((err) => {
      if (err) console.error('Error closing database:', err);
      else console.log('✅ Database connection closed');
    });
  }
}