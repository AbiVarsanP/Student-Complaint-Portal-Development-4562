import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { 
  FaFilter, 
  FaSearch, 
  FaEye, 
  FaTrash, 
  FaCheckCircle, 
  FaClock, 
  FaUser, 
  FaEnvelope,
  FaTag,
  FaCalendar,
  FaImage,
  FaTimes,
  FaPlus,
  FaMapMarkerAlt,
  FaFileAlt,
  FaComment
} from 'react-icons/fa';
import { useComplaints } from '../context/ComplaintContext';
import SupportButton from '../components/SupportButton';
import ImageGallery from '../components/ImageGallery';
import CommentSection from '../components/CommentSection';

const ViewComplaints = () => {
  const { 
    complaints, 
    categories, 
    locations,
    updateComplaintStatus, 
    deleteComplaint,
    addCategory,
    deleteCategory,
    addLocation,
    deleteLocation,
    supportComplaint,
    hasUserSupported,
    addComment
  } = useComplaints();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch = 
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (complaint.studentName && complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !filterCategory || complaint.category === filterCategory;
      const matchesStatus = !filterStatus || complaint.status === filterStatus;
      const matchesLocation = !filterLocation || complaint.location === filterLocation;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [complaints, searchTerm, filterCategory, filterStatus, filterLocation]);

  const handleStatusUpdate = (id, status) => {
    updateComplaintStatus(id, status);
    toast.success(`Complaint marked as ${status}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      deleteComplaint(id);
      toast.success('Complaint deleted successfully');
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(null);
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      addCategory(newCategory.trim());
      toast.success('Category added successfully');
      setNewCategory('');
    } else {
      toast.error('Category already exists or is empty');
    }
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Are you sure you want to delete the "${category}" category?`)) {
      deleteCategory(category);
      toast.success('Category deleted successfully');
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      addLocation(newLocation.trim());
      toast.success('Location added successfully');
      setNewLocation('');
    } else {
      toast.error('Location already exists or is empty');
    }
  };

  const handleDeleteLocation = (location) => {
    if (window.confirm(`Are you sure you want to delete the "${location}" location?`)) {
      deleteLocation(location);
      toast.success('Location deleted successfully');
    }
  };

  const handleSupport = async (complaintId) => {
    return supportComplaint(complaintId);
  };

  const handleAddComment = async (complaintId, comment) => {
    return addComment(complaintId, comment);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="w-3 h-3" />;
      case 'resolved':
        return <FaCheckCircle className="w-3 h-3" />;
      default:
        return <FaClock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Manage Complaints
              </h1>
              <p className="text-gray-600">
                Review and manage student complaints ({filteredComplaints.length} of {complaints.length})
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0">
              <button
                onClick={() => setShowLocationManager(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                Manage Locations
              </button>
              <button
                onClick={() => setShowCategoryManager(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <FaTag className="w-4 h-4 mr-2" />
                Manage Categories
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterStatus('');
                  setFilterLocation('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Complaints Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                        {complaint.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1 capitalize">{complaint.status}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaTag className="w-3 h-3 mr-1" />
                          {complaint.category}
                        </span>
                        {complaint.location && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                            {complaint.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {complaint.description}
                  </p>

                  {/* Images */}
                  {complaint.images && complaint.images.length > 0 && (
                    <div className="mb-4">
                      <ImageGallery images={complaint.images} className="max-w-full" />
                    </div>
                  )}

                  {/* Support and Comments */}
                  <div className="flex items-center justify-between mb-4">
                    <SupportButton
                      complaintId={complaint.id}
                      supportCount={complaint.supportCount || 0}
                      isSupported={hasUserSupported(complaint.id)}
                      onSupport={handleSupport}
                      size="sm"
                    />
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaComment className="w-3 h-3 mr-1" />
                      {complaint.comments?.length || 0}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-1 mb-4 text-xs text-gray-500">
                    {complaint.studentName && (
                      <div className="flex items-center">
                        <FaUser className="w-3 h-3 mr-2" />
                        {complaint.studentName}
                      </div>
                    )}
                    {complaint.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="w-3 h-3 mr-2" />
                        {complaint.email}
                      </div>
                    )}
                    <div className="flex items-center">
                      <FaCalendar className="w-3 h-3 mr-2" />
                      {format(new Date(complaint.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                    >
                      <FaEye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {complaint.status === 'pending' ? (
                      <button
                        onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        <FaCheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(complaint.id, 'pending')}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                      >
                        <FaClock className="w-4 h-4 mr-1" />
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(complaint.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredComplaints.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaFileAlt className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No complaints found
              </h3>
              <p className="text-gray-600">
                {complaints.length === 0 
                  ? "No complaints have been submitted yet."
                  : "Try adjusting your search filters."
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Complaint Details
                  </h2>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status, Category, and Location */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                      {getStatusIcon(selectedComplaint.status)}
                      <span className="ml-2 capitalize">{selectedComplaint.status}</span>
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <FaTag className="w-4 h-4 mr-2" />
                      {selectedComplaint.category}
                    </span>
                    {selectedComplaint.location && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                        {selectedComplaint.location}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedComplaint.title}
                    </h3>
                  </div>

                  {/* Support */}
                  <div className="flex items-center space-x-4">
                    <SupportButton
                      complaintId={selectedComplaint.id}
                      supportCount={selectedComplaint.supportCount || 0}
                      isSupported={hasUserSupported(selectedComplaint.id)}
                      onSupport={handleSupport}
                      size="md"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedComplaint.studentName && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Student Name</h4>
                        <p className="text-gray-600 flex items-center">
                          <FaUser className="w-4 h-4 mr-2" />
                          {selectedComplaint.studentName}
                        </p>
                      </div>
                    )}
                    {selectedComplaint.email && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                        <p className="text-gray-600 flex items-center">
                          <FaEnvelope className="w-4 h-4 mr-2" />
                          {selectedComplaint.email}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submitted Date */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Submitted</h4>
                    <p className="text-gray-600 flex items-center">
                      <FaCalendar className="w-4 h-4 mr-2" />
                      {format(new Date(selectedComplaint.submittedAt), 'MMMM dd, yyyy at HH:mm')}
                    </p>
                  </div>

                  {/* Images */}
                  {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                      <ImageGallery images={selectedComplaint.images} />
                    </div>
                  )}

                  {/* Comments Section */}
                  <CommentSection
                    complaintId={selectedComplaint.id}
                    comments={selectedComplaint.comments || []}
                    onAddComment={handleAddComment}
                  />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                    {selectedComplaint.status === 'pending' ? (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedComplaint.id, 'resolved');
                          setSelectedComplaint({ ...selectedComplaint, status: 'resolved' });
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaCheckCircle className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedComplaint.id, 'pending');
                          setSelectedComplaint({ ...selectedComplaint, status: 'pending' });
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <FaClock className="w-4 h-4 mr-2" />
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDelete(selectedComplaint.id);
                        setSelectedComplaint(null);
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCategoryManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCategoryManager(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Manage Categories
                  </h2>
                  <button
                    onClick={() => setShowCategoryManager(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Add Category */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button
                      onClick={handleAddCategory}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">{category}</span>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Manager Modal */}
      <AnimatePresence>
        {showLocationManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLocationManager(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Manage Locations
                  </h2>
                  <button
                    onClick={() => setShowLocationManager(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Add Location */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter new location"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                    />
                    <button
                      onClick={handleAddLocation}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location List */}
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">{location}</span>
                      <button
                        onClick={() => handleDeleteLocation(location)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewComplaints;