import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ComplaintContext = createContext();

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([
    'Campus',
    'Hostel',
    'Roadways',
    'Transport/Bus',
    'Others'
  ]);
  const [locations, setLocations] = useState([
    'Main Campus',
    'Hostel A',
    'Hostel B', 
    'Hostel C',
    'Block A',
    'Block B',
    'Block C',
    'Library',
    'Cafeteria',
    'Sports Complex',
    'Auditorium',
    'Parking Area',
    'Main Gate',
    'Administrative Block'
  ]);
  const [loading, setLoading] = useState(true);

  // Enhanced storage keys for better data persistence
  const STORAGE_KEYS = {
    complaints: 'std-campuz-complaints-v2',
    categories: 'std-campuz-categories-v2',
    locations: 'std-campuz-locations-v2',
    userSupport: 'std-campuz-user-support-v2'
  };

  useEffect(() => {
    loadFromStorage();
    setLoading(false);
    
    // Set up periodic data sync (simulating real-time updates)
    const interval = setInterval(() => {
      // Check for updates from other tabs/windows
      const event = new CustomEvent('std-campuz-data-sync');
      window.dispatchEvent(event);
    }, 30000);

    // Listen for storage changes from other tabs
    const handleStorageChange = () => {
      loadFromStorage();
    };

    const handleDataSync = () => {
      loadFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('std-campuz-data-sync', handleDataSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('std-campuz-data-sync', handleDataSync);
    };
  }, []);

  const loadFromStorage = () => {
    try {
      const savedComplaints = localStorage.getItem(STORAGE_KEYS.complaints);
      const savedCategories = localStorage.getItem(STORAGE_KEYS.categories);
      const savedLocations = localStorage.getItem(STORAGE_KEYS.locations);
      
      if (savedComplaints) {
        const parsedComplaints = JSON.parse(savedComplaints);
        // Ensure all complaints have required fields
        const validatedComplaints = parsedComplaints.map(complaint => ({
          ...complaint,
          supportCount: complaint.supportCount || 0,
          comments: complaint.comments || [],
          supportedBy: complaint.supportedBy || []
        }));
        setComplaints(validatedComplaints);
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }

      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  };

  const saveToStorage = (complaintsData = complaints, categoriesData = categories, locationsData = locations) => {
    try {
      localStorage.setItem(STORAGE_KEYS.complaints, JSON.stringify(complaintsData));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categoriesData));
      localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locationsData));
      
      // Trigger sync event for other tabs
      const event = new CustomEvent('std-campuz-data-sync');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  const addComplaint = async (complaint) => {
    const newComplaint = {
      id: uuidv4(),
      ...complaint,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      supportCount: 0,
      supportedBy: [],
      comments: []
    };
    
    const updatedComplaints = [...complaints, newComplaint];
    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
    
    return newComplaint.id;
  };

  const updateComplaintStatus = async (id, status) => {
    const updatedComplaints = complaints.map(complaint =>
      complaint.id === id ? { ...complaint, status, updatedAt: new Date().toISOString() } : complaint
    );
    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
  };

  const deleteComplaint = async (id) => {
    const updatedComplaints = complaints.filter(complaint => complaint.id !== id);
    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
  };

  const addCategory = async (category) => {
    if (!categories.includes(category)) {
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      saveToStorage(complaints, updatedCategories, locations);
    }
  };

  const deleteCategory = async (category) => {
    const updatedCategories = categories.filter(cat => cat !== category);
    setCategories(updatedCategories);
    saveToStorage(complaints, updatedCategories, locations);
  };

  const addLocation = async (location) => {
    if (!locations.includes(location)) {
      const updatedLocations = [...locations, location];
      setLocations(updatedLocations);
      saveToStorage(complaints, categories, updatedLocations);
    }
  };

  const deleteLocation = async (location) => {
    const updatedLocations = locations.filter(loc => loc !== location);
    setLocations(updatedLocations);
    saveToStorage(complaints, categories, updatedLocations);
  };

  const supportComplaint = async (id) => {
    const userIdentifier = getUserIdentifier();
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === id) {
        const alreadySupported = complaint.supportedBy?.includes(userIdentifier);
        if (alreadySupported) {
          return {
            ...complaint,
            supportCount: Math.max(0, complaint.supportCount - 1),
            supportedBy: complaint.supportedBy.filter(user => user !== userIdentifier)
          };
        } else {
          return {
            ...complaint,
            supportCount: (complaint.supportCount || 0) + 1,
            supportedBy: [...(complaint.supportedBy || []), userIdentifier]
          };
        }
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
    
    const complaint = updatedComplaints.find(c => c.id === id);
    return complaint.supportedBy?.includes(userIdentifier);
  };

  const hasUserSupported = async (complaintId) => {
    const userIdentifier = getUserIdentifier();
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint?.supportedBy?.includes(userIdentifier) || false;
  };

  const addComment = async (complaintId, comment) => {
    const newComment = {
      id: uuidv4(),
      ...comment,
      timestamp: new Date().toISOString()
    };

    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          comments: [...(complaint.comments || []), newComment]
        };
      }
      return complaint;
    });

    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
    return newComment.id;
  };

  const getUserIdentifier = () => {
    let identifier = localStorage.getItem('std-campuz-userIdentifier');
    if (!identifier) {
      identifier = uuidv4();
      localStorage.setItem('std-campuz-userIdentifier', identifier);
    }
    return identifier;
  };

  const getComplaintStats = async () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    
    const byCategory = categories.reduce((acc, category) => {
      acc[category] = complaints.filter(c => c.category === category).length;
      return acc;
    }, {});
    
    const byLocation = locations.reduce((acc, location) => {
      acc[location] = complaints.filter(c => c.location === location).length;
      return acc;
    }, {});

    return { total, pending, resolved, byCategory, byLocation };
  };

  // Real-time data refresh function
  const refreshData = () => {
    loadFromStorage();
  };

  const value = {
    complaints,
    categories,
    locations,
    loading,
    addComplaint,
    updateComplaintStatus,
    deleteComplaint,
    addCategory,
    deleteCategory,
    addLocation,
    deleteLocation,
    supportComplaint,
    hasUserSupported,
    addComment,
    getComplaintStats,
    refreshData
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};