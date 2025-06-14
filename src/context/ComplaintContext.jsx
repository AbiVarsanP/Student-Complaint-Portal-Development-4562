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
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // API base URL - automatically detects environment
  const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, categoriesRes, locationsRes] = await Promise.all([
        fetch(`${API_BASE}/complaints`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/locations`)
      ]);

      if (complaintsRes.ok && categoriesRes.ok && locationsRes.ok) {
        const [complaintsData, categoriesData, locationsData] = await Promise.all([
          complaintsRes.json(),
          categoriesRes.json(),
          locationsRes.json()
        ]);

        setComplaints(complaintsData);
        setCategories(categoriesData);
        setLocations(locationsData);
      } else {
        console.error('Failed to fetch data from server');
        // Fallback to localStorage if server is unavailable
        const savedComplaints = localStorage.getItem('std-campuz-complaints');
        if (savedComplaints) {
          setComplaints(JSON.parse(savedComplaints));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to localStorage if server is unavailable
      const savedComplaints = localStorage.getItem('std-campuz-complaints');
      if (savedComplaints) {
        setComplaints(JSON.parse(savedComplaints));
      }
    } finally {
      setLoading(false);
    }
  };

  const addComplaint = async (complaint) => {
    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaint),
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchData(); // Refresh data
        return data.id;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  const deleteComplaint = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/complaints/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        throw new Error('Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  };

  const addCategory = async (category) => {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: category }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (category) => {
    try {
      const response = await fetch(`${API_BASE}/categories/${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addLocation = async (location) => {
    try {
      const response = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: location }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  };

  const deleteLocation = async (location) => {
    try {
      const response = await fetch(`${API_BASE}/locations/${encodeURIComponent(location)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        throw new Error('Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  };

  const supportComplaint = async (id) => {
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`${API_BASE}/complaints/${id}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIdentifier }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchData(); // Refresh data
        return data.isSupported;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error toggling support:', error);
      throw error;
    }
  };

  const hasUserSupported = async (complaintId) => {
    try {
      const userIdentifier = getUserIdentifier();
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/support/${userIdentifier}`);
      const data = await response.json();
      return data.isSupported;
    } catch (error) {
      console.error('Error checking support:', error);
      return false;
    }
  };

  const addComment = async (complaintId, comment) => {
    try {
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchData(); // Refresh data
        return data.id;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
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
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const stats = await response.json();
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, pending: 0, resolved: 0, byCategory: {}, byLocation: {} };
    }
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
    refreshData: fetchData
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};