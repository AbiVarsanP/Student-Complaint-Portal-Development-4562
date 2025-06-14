import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaTag, FaFileAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useComplaints } from '../context/ComplaintContext';
import MultiImageUpload from '../components/MultiImageUpload';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { addComplaint, categories, locations } = useComplaints();
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    title: '',
    description: '',
    category: '',
    location: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintId = await addComplaint(formData);
      toast.success('Complaint submitted successfully!');
      
      // Reset form
      setFormData({
        studentName: '',
        email: '',
        title: '',
        description: '',
        category: '',
        location: '',
        images: []
      });
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Submit a Complaint
            </h1>
            <p className="text-gray-600">
              Help us improve by sharing your concerns. All fields marked with * are required.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                  Student Name (Optional)
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your name (optional for anonymous complaints)"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="your.email@college.edu (for follow-up updates)"
                />
              </div>

              {/* Category and Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FaTag className="w-4 h-4 mr-2 text-gray-400" />
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    Location (Optional)
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaFileAlt className="w-4 h-4 mr-2 text-gray-400" />
                  Complaint Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Brief summary of your complaint"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaFileAlt className="w-4 h-4 mr-2 text-gray-400" />
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Please provide detailed information about your complaint..."
                />
              </div>

              {/* Multiple Image Upload */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FaFileAlt className="w-4 h-4 mr-2 text-gray-400" />
                  Attach Images (Optional)
                </label>
                <MultiImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitComplaint;