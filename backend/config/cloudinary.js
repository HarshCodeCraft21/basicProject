const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('\x1b[32m[Cloudinary Configured Successfully]\x1b[0m');
} else {
  console.warn('\x1b[33m[Cloudinary Warning]: Cloudinary environment variables are missing. Images will fall back to local storage inside backend/uploads/.\x1b[0m');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured: !!isCloudinaryConfigured
};
