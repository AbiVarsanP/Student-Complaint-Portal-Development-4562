import express from 'express';
import cors from 'cors';
import { dbOperations } from './database.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes

// Get all complaints
app.get('/api/complaints', (req, res) => {
  try {
    const complaints = dbOperations.getComplaints();
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Add new complaint
app.post('/api/complaints', (req, res) => {
  try {
    const complaint = {
      ...req.body,
      id: uuidv4()
    };
    
    const id = dbOperations.addComplaint(complaint);
    res.json({ id, message: 'Complaint added successfully' });
  } catch (error) {
    console.error('Error adding complaint:', error);
    res.status(500).json({ error: 'Failed to add complaint' });
  }
});

// Update complaint status
app.put('/api/complaints/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const success = dbOperations.updateComplaintStatus(id, status);
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
app.delete('/api/complaints/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const success = dbOperations.deleteComplaint(id);
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
app.post('/api/complaints/:id/support', (req, res) => {
  try {
    const { id } = req.params;
    const { userIdentifier } = req.body;
    
    const isSupported = dbOperations.toggleSupport(id, userIdentifier);
    const supportCount = dbOperations.getSupportCount(id);
    
    res.json({ isSupported, supportCount });
  } catch (error) {
    console.error('Error toggling support:', error);
    res.status(500).json({ error: 'Failed to toggle support' });
  }
});

// Check if user supported
app.get('/api/complaints/:id/support/:userIdentifier', (req, res) => {
  try {
    const { id, userIdentifier } = req.params;
    
    const isSupported = dbOperations.hasUserSupported(id, userIdentifier);
    res.json({ isSupported });
  } catch (error) {
    console.error('Error checking support:', error);
    res.status(500).json({ error: 'Failed to check support' });
  }
});

// Add comment
app.post('/api/complaints/:id/comments', (req, res) => {
  try {
    const { id } = req.params;
    const comment = {
      ...req.body,
      id: uuidv4(),
      complaintId: id
    };
    
    const commentId = dbOperations.addComment(comment);
    res.json({ id: commentId, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = dbOperations.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name } = req.body;
    const success = dbOperations.addCategory(name);
    
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

app.delete('/api/categories/:name', (req, res) => {
  try {
    const { name } = req.params;
    const success = dbOperations.deleteCategory(name);
    
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
app.get('/api/locations', (req, res) => {
  try {
    const locations = dbOperations.getLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.post('/api/locations', (req, res) => {
  try {
    const { name } = req.body;
    const success = dbOperations.addLocation(name);
    
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

app.delete('/api/locations/:name', (req, res) => {
  try {
    const { name } = req.params;
    const success = dbOperations.deleteLocation(name);
    
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
app.get('/api/stats', (req, res) => {
  try {
    const stats = dbOperations.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`STD-Campuz server running on port ${PORT}`);
});