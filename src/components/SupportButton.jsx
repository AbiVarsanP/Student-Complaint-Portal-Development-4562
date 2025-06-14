import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useComplaints } from '../context/ComplaintContext';

const SupportButton = ({ 
  complaintId, 
  supportCount = 0, 
  onSupport,
  size = 'md',
  showCount = true 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentSupportCount, setCurrentSupportCount] = useState(supportCount);
  const { hasUserSupported, complaints } = useComplaints();

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await hasUserSupported(complaintId);
      setIsSupported(supported);
    };
    checkSupport();
  }, [complaintId, hasUserSupported]);

  useEffect(() => {
    // Update support count when complaints change
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      setCurrentSupportCount(complaint.supportCount || 0);
    }
  }, [complaints, complaintId]);

  const handleSupport = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      const newSupportState = await onSupport(complaintId);
      setIsSupported(newSupportState);
      
      // Update local count immediately for better UX
      setCurrentSupportCount(prev => newSupportState ? prev + 1 : Math.max(0, prev - 1));
      
      if (newSupportState) {
        toast.success('Thank you for your support!');
      } else {
        toast.info('Support removed');
      }
    } catch (error) {
      toast.error('Failed to update support');
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const buttonSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.button
      onClick={handleSupport}
      disabled={isAnimating}
      className={`
        flex items-center space-x-2 rounded-lg font-medium transition-all duration-200
        ${buttonSizes[size]}
        ${isSupported 
          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-red-600'
        }
        ${isAnimating ? 'scale-95' : 'hover:scale-105'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isSupported ? (
          <FaHeart className={`${iconSizes[size]} text-red-500`} />
        ) : (
          <FaRegHeart className={iconSizes[size]} />
        )}
      </motion.div>
      
      {showCount && (
        <span className="font-semibold">
          {currentSupportCount > 0 ? currentSupportCount : 'Support'}
        </span>
      )}
    </motion.button>
  );
};

export default SupportButton;