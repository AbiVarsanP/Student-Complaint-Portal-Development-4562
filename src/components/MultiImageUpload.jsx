import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { compressImage, fileToBase64, validateImage } from '../utils/imageUtils';

const MultiImageUpload = ({ images = [], onImagesChange, maxImages = 3 }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);

    try {
      const processedImages = [];
      
      for (const file of files) {
        validateImage(file);
        const compressedFile = await compressImage(file);
        const base64 = await fileToBase64(compressedFile);
        processedImages.push(base64);
      }

      onImagesChange([...images, ...processedImages]);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="multi-image-upload"
        />
        <label
          htmlFor="multi-image-upload"
          className={`cursor-pointer flex flex-col items-center ${
            uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
              <span className="text-gray-600">Processing images...</span>
            </div>
          ) : (
            <>
              <FaUpload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-gray-600">
                {images.length >= maxImages 
                  ? `Maximum ${maxImages} images reached`
                  : `Click to upload images (${images.length}/${maxImages})`
                }
              </span>
              <span className="text-sm text-gray-400 mt-1">
                PNG, JPG, GIF, WebP up to 10MB each
              </span>
            </>
          )}
        </label>
      </div>

      {/* Image Previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Instructions */}
      {images.length === 0 && (
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>• You can upload up to {maxImages} images</p>
          <p>• Images will be automatically compressed for faster loading</p>
          <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;