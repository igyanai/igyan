const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
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

const extractPublicIdFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

const generateTransformedUrl = (imageUrl, transformations) => {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) throw new Error('Invalid Cloudinary URL');
    return cloudinary.url(publicId, transformations);
  } catch (error) {
    console.error('Error generating transformed URL:', error);
    return imageUrl;
  }
};

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

const validateImage = (buffer, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  } = options;

  if (buffer.length > maxSize) {
    throw new Error(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }

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
