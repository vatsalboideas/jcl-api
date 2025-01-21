'use strict';
require('dotenv').config();
const models = require('../models/index');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const response = require('../helpers/response');

// Validation schema for Instagram post
const instagramPostSchema = Joi.object({
  link: Joi.string().required().uri(),
  name: Joi.string().required().trim(),
});

// Create Instagram post
exports.createPost = async (req, res) => {
  try {
    // Validate request body
    const { error } = instagramPostSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    // Create Instagram post record
    const post = await models.instagramPosts.create({
      postId: uuidv4(),
      link: req.body.link,
      name: req.body.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return response.response(
      res,
      false,
      201,
      'Instagram post created successfully',
      {
        postId: post.postId,
        link: post.link,
        name: post.name,
      }
    );
  } catch (error) {
    console.error('Instagram post creation error:', error);
    return response.response(res, true, 500, 'Error creating Instagram post', {
      error: error.message,
    });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await models.instagramPosts.findOne({
      where: { postId },
    });

    if (!post) {
      return response.response(res, true, 404, 'Instagram post not found');
    }

    return response.response(
      res,
      false,
      200,
      'Instagram post retrieved successfully',
      post
    );
  } catch (error) {
    console.error('Get post error:', error);
    return response.response(
      res,
      true,
      500,
      'Error retrieving Instagram post',
      {
        error: error.message,
      }
    );
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate request body
    const { error } = instagramPostSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const post = await models.instagramPosts.findOne({
      where: { postId },
    });

    if (!post) {
      return response.response(res, true, 404, 'Instagram post not found');
    }

    // Update post
    await post.update({
      link: req.body.link,
      name: req.body.name,
      updatedAt: new Date(),
    });

    return response.response(
      res,
      false,
      200,
      'Instagram post updated successfully',
      post
    );
  } catch (error) {
    console.error('Update post error:', error);
    return response.response(res, true, 500, 'Error updating Instagram post', {
      error: error.message,
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await models.instagramPosts.findOne({
      where: { postId },
    });

    if (!post) {
      return response.response(res, true, 404, 'Instagram post not found');
    }

    // Delete from database
    await post.destroy();

    return response.response(
      res,
      false,
      200,
      'Instagram post deleted successfully'
    );
  } catch (error) {
    console.error('Delete post error:', error);
    return response.response(res, true, 500, 'Error deleting Instagram post', {
      error: error.message,
    });
  }
};

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.instagramPosts.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return response.response(
      res,
      false,
      200,
      'Instagram posts retrieved successfully',
      {
        posts: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      }
    );
  } catch (error) {
    console.error('Get all posts error:', error);
    return response.response(
      res,
      true,
      500,
      'Error retrieving Instagram posts',
      {
        error: error.message,
      }
    );
  }
};
