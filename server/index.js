import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './database.js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await db.pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected to Neon PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Connection failed',
      error: error.message
    });
  }
});

// Get all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await db.getComplaints();
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Add new complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = {
      ...req.body,
      id: uuidv4()
    };
    
    const id = await db.addComplaint(complaint);
    res.json({ id, message: 'Complaint added successfully' });
  } catch (error) {
    console.error('Error adding complaint:', error);
    res.status(500).json({ error: 'Failed to add complaint' });
  }
});

// Update complaint status
app.put('/api/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const success = await db.updateComplaintStatus(id, status);
    if (success) {
      res.json({ message: 'Status updated successfully' });
    } else {
      res.status(404).json({ error: 'Complaint not found' });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await db.deleteComplaint(id);
    if (success) {
      res.json({ message: 'Complaint deleted successfully' });
    } else {
      res.status(404).json({ error: 'Complaint not found' });
    }
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// Toggle support
app.post('/api/complaints/:id/support', async (req, res) => {
  try {
    const { id } = req.params;
    const { userIdentifier } = req.body;
    
    const isSupported = await db.toggleSupport(id, userIdentifier);
    const supportCount = await db.getSupportCount(id);
    
    res.json({ isSupported, supportCount });
  } catch (error) {
    console.error('Error toggling support:', error);
    res.status(500).json({ error: 'Failed to toggle support' });
  }
});

// Check if user supported
app.get('/api/complaints/:id/support/:userIdentifier', async (req, res) => {
  try {
    const { id, userIdentifier } = req.params;
    
    const isSupported = await db.hasUserSupported(id, userIdentifier);
    res.json({ isSupported });
  } catch (error) {
    console.error('Error checking support:', error);
    res.status(500).json({ error: 'Failed to check support' });
  }
});

// Add comment
app.post('/api/complaints/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = {
      ...req.body,
      id: uuidv4(),
      complaintId: id
    };
    
    const commentId = await db.addComment(comment);
    res.json({ id: commentId, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const success = await db.addCategory(name);
    
    if (success) {
      res.json({ message: 'Category added successfully' });
    } else {
      res.status(400).json({ error: 'Category already exists' });
    }
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.delete('/api/categories/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const success = await db.deleteCategory(name);
    
    if (success) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await db.getLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    const { name } = req.body;
    const success = await db.addLocation(name);
    
    if (success) {
      res.json({ message: 'Location added successfully' });
    } else {
      res.status(400).json({ error: 'Location already exists' });
    }
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ error: 'Failed to add location' });
  }
});

app.delete('/api/locations/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const success = await db.deleteLocation(name);
    
    if (success) {
      res.json({ message: 'Location deleted successfully' });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check credentials
    if (username === 'Campuz' && password === 'Campuz@001') {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 STD-Campuz server running on port ${PORT}`);
  console.log(`📊 Database: Neon PostgreSQL`);
  console.log(`🌐 Access API at: http://localhost:${PORT}/api`);
  console.log(`💻 Frontend should run on: http://localhost:5173`);
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));