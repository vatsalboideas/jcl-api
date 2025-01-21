const express = require('express');
const router = express.Router();
const InstagramController = require('../controllers/instagramPost.controller');

// Create Instagram post
router.post('/', InstagramController.createPost);

// Get all Instagram posts with pagination
router.get('/', InstagramController.getAllPosts);

// Get specific Instagram post by ID
router.get('/:postId', InstagramController.getPostById);

// Update Instagram post
router.put('/:postId', InstagramController.updatePost);

// Delete Instagram post
router.delete('/:postId', InstagramController.deletePost);

module.exports = router;
