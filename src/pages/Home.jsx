import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaFileAlt, FaUsers, FaChartBar, FaShieldAlt, FaComment, FaMapMarkerAlt, FaEye, FaTimes, FaUser, FaEnvelope, FaCalendar, FaSync } from 'react-icons/fa';
import { useComplaints } from '../context/ComplaintContext';
import SupportButton from '../components/SupportButton';
import ImageGallery from '../components/ImageGallery';
import CommentSection from '../components/CommentSection';

const Home = () => {
  const { 
    complaints, 
    supportComplaint, 
    addComment,
    loading,
    refreshData
  } = useComplaints();
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get recent complaints for public view
  const recentComplaints = complaints
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, showAllComplaints ? complaints.length : 6);

  const handleSupport = async (complaintId) => {
    try {
      return await supportComplaint(complaintId);
    } catch (error) {
      console.error('Error supporting complaint:', error);
      throw error;
    }
  };

  const handleAddComment = async (complaintId, comment) => {
    try {
      return await addComment(complaintId, comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    refreshData();
    setIsRefreshing(false);
  };

  const features = [
    {
      icon: FaFileAlt,
      title: 'Easy Complaint Submission',
      description: 'Submit your complaints quickly with our user-friendly form',
      color: 'text-blue-500'
    },
    {
      icon: FaUsers,
      title: 'Community Support',
      description: 'Support complaints and engage with community discussions',
      color: 'text-green-500'
    },
    {
      icon: FaChartBar,
      title: 'Track Progress',
      description: 'Monitor the status of complaints in real-time',
      color: 'text-purple-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Anonymous',
      description: 'Your privacy is protected with optional anonymous submissions',
      color: 'text-red-500'
    }
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
              STD-Campuz Portal
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-primary-100">
              Your voice matters. Submit complaints and help improve our campus experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit"
                className="bg-white text-primary-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Submit a Complaint
              </Link>
              <Link
                to="/admin/login"
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                Admin Access
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We've designed this portal to make it easy for students to voice their concerns 
              and for administrators to address them efficiently.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} bg-gray-100 rounded-full mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Complaints Section */}
      {complaints.length > 0 && (
        <section className="py-12 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Recent Complaints
                  </h2>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <FaSync className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                <p className="text-lg text-gray-600">
                  See what issues your fellow students are raising and show your support
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {recentComplaints.map((complaint, index) => (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {complaint.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            <span className="capitalize">{complaint.status}</span>
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

                      {/* Meta Info */}
                      <div className="text-xs text-gray-500 mb-4">
                        <div className="flex items-center justify-between">
                          <span>
                            {format(new Date(complaint.submittedAt), 'MMM dd, yyyy')}
                          </span>
                          {complaint.studentName && (
                            <span>By: {complaint.studentName}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <SupportButton
                            complaintId={complaint.id}
                            supportCount={complaint.supportCount || 0}
                            onSupport={handleSupport}
                            size="sm"
                          />
                          <div className="flex items-center text-gray-500 text-sm">
                            <FaComment className="w-3 h-3 mr-1" />
                            {complaint.comments?.length || 0}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="flex items-center px-3 py-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <FaEye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Show More/Less Button */}
              {complaints.length > 6 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllComplaints(!showAllComplaints)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {showAllComplaints ? 'Show Less' : `View All ${complaints.length} Complaints`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of students who have already used our platform to improve 
              their campus experience. Your feedback drives positive change.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              <FaFileAlt className="w-5 h-5 mr-2" />
              Submit Your First Complaint
            </Link>
          </motion.div>
        </div>
      </section>

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
                    {selectedComplaint.title}
                  </h2>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status, Category, and Location */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                      <span className="capitalize">{selectedComplaint.status}</span>
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {selectedComplaint.category}
                    </span>
                    {selectedComplaint.location && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                        {selectedComplaint.location}
                      </span>
                    )}
                  </div>

                  {/* Support */}
                  <div className="flex items-center space-x-4">
                    <SupportButton
                      complaintId={selectedComplaint.id}
                      supportCount={selectedComplaint.supportCount || 0}
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;