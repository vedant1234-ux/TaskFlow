const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'taskflow_uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'txt', 'csv'],
    resource_type: 'auto', // Automatically determine if it's an image or raw file
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// @route   POST /api/upload
// @desc    Upload a single file to Cloudinary
// @access  Private (though not strictly checking token here, assumes use behind protect middleware)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  // Build the URL to access the file directly from Cloudinary
  const fileUrl = req.file.path; // Cloudinary returns the secure URL in req.file.path

  res.status(200).json({
    success: true,
    file: {
      name: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      type: req.file.mimetype,
    },
  });
});

module.exports = router;
