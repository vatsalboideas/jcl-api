'use strict';
const { v4: uuidv4 } = require('uuid');
const models = require('../models/index');
const response = require('../helpers/response');
const Joi = require('joi');

// Validation schema for work detail data
const workDetailSchema = Joi.object({
  videoUrl: Joi.string().uri().required(),
  description: Joi.string().max(500).optional(),
  name: Joi.string().max(255).required(),
  media: Joi.string().guid().required(),
  workId: Joi.string().guid().required(),
});

// Create Work Detail
exports.createWorkDetail = async (req, res) => {
  try {
    const { error } = workDetailSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const { videoUrl, description, name, media, workId } = req.body;

    const newWorkDetail = await models.workDetailData.create({
      workDetailId: uuidv4(),
      videoUrl,
      description,
      name,
      media,
      workId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return response.response(
      res,
      false,
      201,
      'Work detail created successfully',
      newWorkDetail
    );
  } catch (error) {
    console.error('Create work detail error:', error);
    return response.response(res, true, 500, 'Error creating work detail', {
      error: error.message,
    });
  }
};

// Get All Work Details
exports.getAllWorkDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.workDetailData.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: models.workData,
          as: 'work',
        },
        {
          model: models.media,
          as: 'mediaData',
        },
      ],
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
    console.error('Get all work details error:', error);
    return response.response(res, true, 500, 'Error retrieving work details', {
      error: error.message,
    });
  }
};

// Get Specific Work Detail by ID
exports.getWorkDetailById = async (req, res) => {
  try {
    const { workDetailId } = req.params;

    const workDetail = await models.workDetailData.findOne({
      where: { workDetailId },
      include: [
        {
          model: models.workData,
          as: 'work',
        },
        {
          model: models.media,
          as: 'mediaData',
        },
      ],
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

// Update Work Detail
exports.updateWorkDetail = async (req, res) => {
  try {
    const { workDetailId } = req.params;

    const { error } = workDetailSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const { videoUrl, description, name, media, workId } = req.body;

    const workDetail = await models.workDetailData.findOne({
      where: { workDetailId },
    });

    if (!workDetail) {
      return response.response(res, true, 404, 'Work detail not found');
    }

    workDetail.videoUrl = videoUrl;
    workDetail.description = description || workDetail.description;
    workDetail.name = name;
    workDetail.media = media;
    workDetail.workId = workId;
    workDetail.updatedAt = new Date();

    await workDetail.save();

    return response.response(
      res,
      false,
      200,
      'Work detail updated successfully',
      workDetail
    );
  } catch (error) {
    console.error('Update work detail error:', error);
    return response.response(res, true, 500, 'Error updating work detail', {
      error: error.message,
    });
  }
};

// Delete Work Detail
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
