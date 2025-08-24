const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      resource_type: 'image',
      folder: 'i-gyan-ai',
      use_filename: true,
      unique_filename: true,
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload image'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      throw new Error('Invalid Cloudinary URL');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if invalid
 */
const extractPublicIdFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after /upload/v{version}/
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Generate transformation URL for existing image
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {Object} transformations - Transformation options
 * @returns {string} - Transformed image URL
 */
const generateTransformedUrl = (imageUrl, transformations) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) throw new Error('Invalid Cloudinary URL');

    return cloudinary.url(publicId, transformations);
  } catch (error) {
    console.error('Error generating transformed URL:', error);
    return imageUrl; // Return original URL if transformation fails
  }
};

/**
 * Upload multiple images
 * @param {Array<Buffer>} buffers - Array of image buffers
 * @param {Object} options - Upload options
 * @returns {Promise<Array<string>>} - Array of Cloudinary URLs
 */
const uploadMultipleToCloudinary = async (buffers, options = {}) => {
  try {
    const uploadPromises = buffers.map((buffer, index) => 
      uploadToCloudinary(buffer, {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index}` : undefined
      })
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Get image info from Cloudinary
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<Object>} - Image information
 */
const getImageInfo = async (imageUrl) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) throw new Error('Invalid Cloudinary URL');

    const result = await cloudinary.api.resource(publicId);
    return {
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    throw new Error('Failed to get image information');
  }
};

/**
 * Create responsive image URLs
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {Array<number>} widths - Array of widths for responsive images
 * @returns {Object} - Object with different sized URLs
 */
const createResponsiveUrls = (imageUrl, widths = [300, 600, 900, 1200]) => {
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (!publicId) return { original: imageUrl };

  const urls = { original: imageUrl };
  
  widths.forEach(width => {
    urls[`w_${width}`] = cloudinary.url(publicId, {
      width,
      crop: 'scale',
      quality: 'auto',
      fetch_format: 'auto'
    });
  });

  return urls;
};

/**
 * Validate image file
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Validation options
 * @returns {boolean} - Whether image is valid
 */
const validateImage = (buffer, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  } = options;

  // Check file size
  if (buffer.length > maxSize) {
    throw new Error(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }

  // Basic format checking based on file headers
  const fileSignatures = {
    'jpg': [0xFF, 0xD8, 0xFF],
    'jpeg': [0xFF, 0xD8, 0xFF],
    'png': [0x89, 0x50, 0x4E, 0x47],
    'gif': [0x47, 0x49, 0x46],
    'webp': [0x52, 0x49, 0x46, 0x46]
  };

  let isValidFormat = false;
  for (const [format, signature] of Object.entries(fileSignatures)) {
    if (allowedFormats.includes(format)) {
      const matches = signature.every((byte, index) => buffer[index] === byte);
      if (matches) {
        isValidFormat = true;
        break;
      }
    }
  }

  if (!isValidFormat) {
    throw new Error(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`);
  }

  return true;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  generateTransformedUrl,
  uploadMultipleToCloudinary,
  getImageInfo,
  createResponsiveUrls,
  validateImage,
  extractPublicIdFromUrl
};