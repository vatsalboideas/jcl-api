'use strict';
require('dotenv').config();
const models = require('../models/index');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const response = require('../helpers/response');

// Validation schema for work detail
const workDetailSchema = Joi.object({
  videoUrl: Joi.string().uri().allow(''),
  description: Joi.string().required(),
  name: Joi.string().required(),
  media: Joi.string().uuid().allow(null),
  detailsData: Joi.string().uuid().required(), // workId reference
}).unknown(true);

// Helper function for common includes
const includeAssociations = [
  {
    model: models.workData,
    as: 'work',
    attributes: ['workId', 'name', 'slug', 'websiteLink'],
  },
  {
    model: models.media,
    as: 'mediaData',
    attributes: [
      'mediaId',
      'url',
      'name',
      'type',
      'size',
      'mime',
      'height',
      'width',
    ],
  },
];

// Create work detail
exports.createWorkDetail = async (req, res) => {
  try {
    // Validate request body
    const { error } = workDetailSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    // Verify work exists
    const work = await models.workData.findOne({
      where: { workId: req.body.detailsData },
    });

    if (!work) {
      return response.response(res, true, 404, 'Associated work not found');
    }

    // If media is provided, verify it exists
    if (req.body.media) {
      const media = await models.media.findOne({
        where: { mediaId: req.body.media },
      });

      if (!media) {
        return response.response(res, true, 404, 'Associated media not found');
      }
    }

    // Create work detail record
    const workDetail = await models.workDetailData.create({
      workDetailId: uuidv4(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fetch created record with associations
    const createdDetail = await models.workDetailData.findOne({
      where: { workDetailId: workDetail.workDetailId },
      include: includeAssociations,
    });

    return response.response(
      res,
      false,
      201,
      'Work detail created successfully',
      createdDetail
    );
  } catch (error) {
    console.error('Work detail creation error:', error);
    return response.response(res, true, 500, 'Error creating work detail', {
      error: error.message,
    });
  }
};

// Get work detail by ID
exports.getWorkDetailById = async (req, res) => {
  try {
    const { workDetailId } = req.params;

    const workDetail = await models.workDetailData.findOne({
      where: { workDetailId },
      include: includeAssociations,
    });

    if (!workDetail) {
      return response.response(res, true, 404, 'Work detail not found');
    }

    return response.response(
      res,
      false,
      200,
      'Work detail retrieved successfully',
      workDetail
    );
  } catch (error) {
    console.error('Get work detail error:', error);
    return response.response(res, true, 500, 'Error retrieving work detail', {
      error: error.message,
    });
  }
};

// Update work detail
exports.updateWorkDetail = async (req, res) => {
  try {
    const { workDetailId } = req.params;

    // Validate request body
    const { error } = workDetailSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const workDetail = await models.workDetailData.findOne({
      where: { workDetailId },
    });

    if (!workDetail) {
      return response.response(res, true, 404, 'Work detail not found');
    }

    // Verify work exists
    const work = await models.workData.findOne({
      where: { workId: req.body.detailsData },
    });

    if (!work) {
      return response.response(res, true, 404, 'Associated work not found');
    }

    // If media is provided, verify it exists
    if (req.body.media) {
      const media = await models.media.findOne({
        where: { mediaId: req.body.media },
      });

      if (!media) {
        return response.response(res, true, 404, 'Associated media not found');
      }
    }

    // Update work detail
    await workDetail.update({
      ...req.body,
      updatedAt: new Date(),
    });

    // Fetch updated record with associations
    const updatedDetail = await models.workDetailData.findOne({
      where: { workDetailId },
      include: includeAssociations,
    });

    return response.response(
      res,
      false,
      200,
      'Work detail updated successfully',
      updatedDetail
    );
  } catch (error) {
    console.error('Update work detail error:', error);
    return response.response(res, true, 500, 'Error updating work detail', {
      error: error.message,
    });
  }
};

// Delete work detail
exports.deleteWorkDetail = async (req, res) => {
  try {
    const { workDetailId } = req.params;

    const workDetail = await models.workDetailData.findOne({
      where: { workDetailId },
    });

    if (!workDetail) {
      return response.response(res, true, 404, 'Work detail not found');
    }

    await workDetail.destroy();

    return response.response(
      res,
      false,
      200,
      'Work detail deleted successfully'
    );
  } catch (error) {
    console.error('Delete work detail error:', error);
    return response.response(res, true, 500, 'Error deleting work detail', {
      error: error.message,
    });
  }
};

// Get all work details for a specific work
exports.getWorkDetails = async (req, res) => {
  try {
    const { workId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Verify work exists
    const work = await models.workData.findOne({
      where: { workId },
    });

    if (!work) {
      return response.response(res, true, 404, 'Work not found');
    }

    const { count, rows } = await models.workDetailData.findAndCountAll({
      where: { detailsData: workId },
      limit,
      offset,
      include: includeAssociations,
      order: [['createdAt', 'DESC']],
    });

    return response.response(
      res,
      false,
      200,
      'Work details retrieved successfully',
      {
        workDetails: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      }
    );
  } catch (error) {
    console.error('Get work details error:', error);
    return response.response(res, true, 500, 'Error retrieving work details', {
      error: error.message,
    });
  }
};

// Get all work details (admin route)
exports.getAllWorkDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.workDetailData.findAndCountAll({
      limit,
      offset,
      include: includeAssociations,
      order: [['createdAt', 'DESC']],
    });

    return response.response(
      res,
      false,
      200,
      'All work details retrieved successfully',
      {
        workDetails: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      }
    );
  } catch (error) {
    console.error('Get all work details error:', error);
    return response.response(
      res,
      true,
      500,
      'Error retrieving all work details',
      {
        error: error.message,
      }
    );
  }
};
