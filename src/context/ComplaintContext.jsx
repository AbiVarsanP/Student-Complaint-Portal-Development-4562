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

  useEffect(() => {
    const savedComplaints = localStorage.getItem('complaints');
    const savedCategories = localStorage.getItem('categories');
    const savedLocations = localStorage.getItem('locations');
    
    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints));
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }
  }, []);

  const saveToStorage = (complaintsData, categoriesData = categories, locationsData = locations) => {
    localStorage.setItem('complaints', JSON.stringify(complaintsData));
    localStorage.setItem('categories', JSON.stringify(categoriesData));
    localStorage.setItem('locations', JSON.stringify(locationsData));
  };

  const addComplaint = (complaint) => {
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

  const updateComplaintStatus = (id, status) => {
    const updatedComplaints = complaints.map(complaint =>
      complaint.id === id ? { ...complaint, status } : complaint
    );
    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
  };

  const deleteComplaint = (id) => {
    const updatedComplaints = complaints.filter(complaint => complaint.id !== id);
    setComplaints(updatedComplaints);
    saveToStorage(updatedComplaints);
  };

  const addCategory = (category) => {
    if (!categories.includes(category)) {
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      saveToStorage(complaints, updatedCategories, locations);
    }
  };

  const deleteCategory = (category) => {
    const updatedCategories = categories.filter(cat => cat !== category);
    setCategories(updatedCategories);
    saveToStorage(complaints, updatedCategories, locations);
  };

  const addLocation = (location) => {
    if (!locations.includes(location)) {
      const updatedLocations = [...locations, location];
      setLocations(updatedLocations);
      saveToStorage(complaints, categories, updatedLocations);
    }
  };

  const deleteLocation = (location) => {
    const updatedLocations = locations.filter(loc => loc !== location);
    setLocations(updatedLocations);
    saveToStorage(complaints, categories, updatedLocations);
  };

  const supportComplaint = (id) => {
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

  const addComment = (complaintId, comment) => {
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
    let identifier = localStorage.getItem('userIdentifier');
    if (!identifier) {
      identifier = uuidv4();
      localStorage.setItem('userIdentifier', identifier);
    }
    return identifier;
  };

  const hasUserSupported = (complaintId) => {
    const userIdentifier = getUserIdentifier();
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint?.supportedBy?.includes(userIdentifier) || false;
  };

  const getComplaintStats = () => {
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

  const value = {
    complaints,
    categories,
    locations,
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
    getComplaintStats
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};