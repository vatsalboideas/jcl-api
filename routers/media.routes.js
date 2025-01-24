const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/media.controller');
const uploadMiddleware = require('../utils/media');
const jwtAuth = require('../middlewares/authentication.middleware');

// Upload single media file
router.post(
  '/upload',
  // jwtAuth.requireReadAccess,
  uploadMiddleware,
  MediaController.uploadMedia
);

// Get all media with pagination
router.get('/', MediaController.getAllMedia);

// Get specific media by ID
router.get('/:mediaId', MediaController.getMediaById);

// Delete media
router.delete('/:mediaId', MediaController.deleteMedia);

module.exports = router;
