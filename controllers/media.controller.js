'use strict';
require('dotenv').config();
const models = require('../models/index');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const response = require('../helpers/response');
const path = require('path');
const fs = require('fs');

// Helper function to check if media can be safely deleted
exports.canDeleteMedia = async (mediaId) => {
  const [workWithLandscape, workWithVertical, workWithSquare, workDetail] =
    await Promise.all([
      models.workData.findOne({ where: { landscapeImage: mediaId } }),
      models.workData.findOne({ where: { verticalImage: mediaId } }),
      models.workData.findOne({ where: { squareImage: mediaId } }),
      models.workDetailData.findOne({ where: { media: mediaId } }),
    ]);

  return !(
    workWithLandscape ||
    workWithVertical ||
    workWithSquare ||
    workDetail
  );
};

// Validation schema for file uploads
const fileValidationSchema = Joi.object({
  mimetype: Joi.string()
    .valid(
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    )
    .required(),
  size: Joi.number().max(5 * 1024 * 1024), // 5MB limit
}).unknown(true);

exports.uploadMedia = async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      return response.response(res, true, 400, 'Please upload a media file');
    }

    // Validate file
    const { error } = fileValidationSchema.validate(req.file);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    // Create relative URL path
    const relativePath = req.file.path.replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes

    // Create media record
    const media = await models.Media.create({
      mediaId: uuidv4(),
      name: req.file.filename,
      type: req.file.mimetype,
      size: req.file.size,
      url: relativePath,
      mime: req.file.mimetype,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success response with media details
    return response.response(res, false, 200, 'Media uploaded successfully', {
      mediaId: media.mediaId,
      name: media.name,
      type: media.type,
      size: media.size,
      url: media.url,
      mime: media.mime,
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return response.response(res, true, 500, 'Error uploading media', {
      error: error.message,
    });
  }
};

// Get media by ID
exports.getMediaById = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await models.Media.findOne({
      where: { mediaId },
    });

    if (!media) {
      return response.response(res, true, 404, 'Media not found');
    }

    return response.response(
      res,
      false,
      200,
      'Media retrieved successfully',
      media
    );
  } catch (error) {
    console.error('Get media error:', error);
    return response.response(res, true, 500, 'Error retrieving media', {
      error: error.message,
    });
  }
};

// // Delete media
// exports.deleteMedia = async (req, res) => {
//     try {
//         const { mediaId } = req.params;

//         const media = await models.Media.findOne({
//             where: { mediaId }
//         });

//         if (!media) {
//             return response.response(res, true, 404, "Media not found");
//         }

//         // Delete file from filesystem
//         const fs = require('fs');
//         if (fs.existsSync(media.url)) {
//             fs.unlinkSync(media.url);
//         }

//         // Delete from database
//         await media.destroy();

//         return response.response(res, false, 200, "Media deleted successfully");

//     } catch (error) {
//         console.error('Delete media error:', error);
//         return response.response(res, true, 500, "Error deleting media", {
//             error: error.message
//         });
//     }
// };

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    // First check if this media is referenced anywhere
    const [workWithLandscape, workWithVertical, workWithSquare, workDetail] =
      await Promise.all([
        models.workData.findOne({ where: { landscapeImage: mediaId } }),
        models.workData.findOne({ where: { verticalImage: mediaId } }),
        models.workData.findOne({ where: { squareImage: mediaId } }),
        models.workDetailData.findOne({ where: { media: mediaId } }),
      ]);

    if (workWithLandscape || workWithVertical || workWithSquare || workDetail) {
      return response.response(
        res,
        true,
        400,
        'Cannot delete media as it is being used in work data or work details'
      );
    }

    const media = await models.media.findOne({
      where: { mediaId },
    });

    if (!media) {
      return response.response(res, true, 404, 'Media not found');
    }

    try {
      // Get absolute file path
      const filePath = path.resolve(media.url);

      // Check if file exists
      await fs.access(filePath);

      // Delete file from filesystem
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('File deletion error:', fileError);
      // We'll continue with database deletion even if file deletion fails
      // but we'll log the error for monitoring
      console.warn(`File not found or could not be deleted: ${media.url}`);
    }

    // Delete from database
    await media.destroy();

    return response.response(res, false, 200, 'Media deleted successfully');
  } catch (error) {
    console.error('Delete media error:', error);
    return response.response(res, true, 500, 'Error deleting media', {
      error: error.message,
    });
  }
};

// Get all media with pagination
exports.getAllMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.Media.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return response.response(res, false, 200, 'Media retrieved successfully', {
      media: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all media error:', error);
    return response.response(res, true, 500, 'Error retrieving media', {
      error: error.message,
    });
  }
};

// Optional: Bulk delete media
exports.bulkDeleteMedia = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!Array.isArray(mediaIds)) {
      return response.response(res, true, 400, 'mediaIds must be an array');
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const mediaId of mediaIds) {
      try {
        // Check if media can be deleted
        const canDelete = await exports.canDeleteMedia(mediaId);
        if (!canDelete) {
          results.failed.push({
            mediaId,
            reason: 'Media is in use',
          });
          continue;
        }

        const media = await models.media.findOne({
          where: { mediaId },
        });

        if (!media) {
          results.failed.push({
            mediaId,
            reason: 'Media not found',
          });
          continue;
        }

        // Try to delete file
        try {
          const filePath = path.resolve(media.url);
          await fs.access(filePath);
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn(`File not found or could not be deleted: ${media.url}`);
        }

        // Delete from database
        await media.destroy();
        results.success.push(mediaId);
      } catch (error) {
        results.failed.push({
          mediaId,
          reason: error.message,
        });
      }
    }

    return response.response(
      res,
      false,
      200,
      'Bulk delete operation completed',
      results
    );
  } catch (error) {
    console.error('Bulk delete media error:', error);
    return response.response(res, true, 500, 'Error in bulk delete operation', {
      error: error.message,
    });
  }
};
