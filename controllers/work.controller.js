'use strict';
require('dotenv').config();
const models = require('../models/index');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const response = require('../helpers/response');
const slugify = require('slugify');

// Validation schema for work
const workSchema = Joi.object({
  name: Joi.string().required(),
  landscapeImage: Joi.string().uuid().allow(null),
  verticalImage: Joi.string().uuid().allow(null),
  squareImage: Joi.string().uuid().allow(null),
  data: Joi.string().allow(''),
  websiteLink: Joi.string().uri().allow(''),
}).unknown(true);

// Helper function for common includes - fixed media attributes
const includeAssociations = [
  {
    model: models.media,
    as: 'landscapeImageData',
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
  {
    model: models.media,
    as: 'verticalImageData',
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
  {
    model: models.media,
    as: 'squareImageData',
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
  {
    model: models.workDetailData,
    as: 'workDetails',
    attributes: ['videoUrl', 'description', 'name', 'media'],
    include: [
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
    ],
  },
];

// Create work
exports.createWork = async (req, res) => {
  try {
    // Validate request body
    const { error } = workSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    // Generate slug from name
    const baseSlug = slugify(req.body.name, { lower: true });
    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness
    while (await models.workData.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Verify all media exists if provided
    const mediaFields = ['landscapeImage', 'verticalImage', 'squareImage'];
    for (const field of mediaFields) {
      if (req.body[field]) {
        const media = await models.media.findOne({
          where: { mediaId: req.body[field] },
          attributes: ['mediaId'], // Only check for existence
        });
        if (!media) {
          return response.response(res, true, 404, `${field} media not found`);
        }
      }
    }

    // Create work record
    const workData = {
      workId: uuidv4(),
      name: req.body.name,
      landscapeImage: req.body.landscapeImage || null,
      verticalImage: req.body.verticalImage || null,
      squareImage: req.body.squareImage || null,
      data: req.body.data || '',
      websiteLink: req.body.websiteLink || '',
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const work = await models.workData.create(workData);

    // Fetch created record with associations
    const createdWork = await models.workData.findOne({
      where: { workId: work.workId },
      include: includeAssociations,
    });

    return response.response(
      res,
      false,
      201,
      'Work created successfully',
      createdWork
    );
  } catch (error) {
    console.error('Work creation error:', error);
    return response.response(res, true, 500, 'Error creating work', {
      error: error.message,
    });
  }
};

// Get work by ID
exports.getWorkById = async (req, res) => {
  try {
    const { workId } = req.params;

    const work = await models.workData.findOne({
      where: { workId },
      include: includeAssociations,
    });

    if (!work) {
      return response.response(res, true, 404, 'Work not found');
    }

    return response.response(
      res,
      false,
      200,
      'Work retrieved successfully',
      work
    );
  } catch (error) {
    console.error('Get work error:', error);
    return response.response(res, true, 500, 'Error retrieving work', {
      error: error.message,
    });
  }
};

// Get work by slug
exports.getWorkBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const work = await models.workData.findOne({
      where: { slug },
      include: includeAssociations,
    });

    if (!work) {
      return response.response(res, true, 404, 'Work not found');
    }

    return response.response(
      res,
      false,
      200,
      'Work retrieved successfully',
      work
    );
  } catch (error) {
    console.error('Get work by slug error:', error);
    return response.response(res, true, 500, 'Error retrieving work', {
      error: error.message,
    });
  }
};

// Update work
exports.updateWork = async (req, res) => {
  try {
    const { workId } = req.params;

    // Validate request body
    const { error } = workSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const work = await models.workData.findOne({
      where: { workId },
    });

    if (!work) {
      return response.response(res, true, 404, 'Work not found');
    }

    // If name is being updated, update slug
    let slug = work.slug;
    if (req.body.name && req.body.name !== work.name) {
      const baseSlug = slugify(req.body.name, { lower: true });
      slug = baseSlug;
      let counter = 1;

      while (
        await models.workData.findOne({
          where: {
            slug,
            workId: { [models.Sequelize.Op.ne]: workId },
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Verify all media exists if provided
    const mediaFields = ['landscapeImage', 'verticalImage', 'squareImage'];
    for (const field of mediaFields) {
      if (req.body[field]) {
        const media = await models.media.findOne({
          where: { mediaId: req.body[field] },
          attributes: ['mediaId'], // Only check for existence
        });
        if (!media) {
          return response.response(res, true, 404, `${field} media not found`);
        }
      }
    }

    // Update work
    const updateData = {
      name: req.body.name,
      landscapeImage: req.body.landscapeImage || work.landscapeImage,
      verticalImage: req.body.verticalImage || work.verticalImage,
      squareImage: req.body.squareImage || work.squareImage,
      data: req.body.data || work.data,
      websiteLink: req.body.websiteLink || work.websiteLink,
      slug,
      updatedAt: new Date(),
    };

    await work.update(updateData);

    // Fetch updated record with associations
    const updatedWork = await models.workData.findOne({
      where: { workId },
      include: includeAssociations,
    });

    return response.response(
      res,
      false,
      200,
      'Work updated successfully',
      updatedWork
    );
  } catch (error) {
    console.error('Update work error:', error);
    return response.response(res, true, 500, 'Error updating work', {
      error: error.message,
    });
  }
};

// Delete work
exports.deleteWork = async (req, res) => {
  try {
    const { workId } = req.params;

    const work = await models.workData.findOne({
      where: { workId },
    });

    if (!work) {
      return response.response(res, true, 404, 'Work not found');
    }

    await work.destroy();

    return response.response(res, false, 200, 'Work deleted successfully');
  } catch (error) {
    console.error('Delete work error:', error);
    return response.response(res, true, 500, 'Error deleting work', {
      error: error.message,
    });
  }
};

// Get all works with pagination
exports.getAllWorks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.workData.findAndCountAll({
      limit,
      offset,
      include: includeAssociations,
      order: [['createdAt', 'DESC']],
    });

    return response.response(res, false, 200, 'Works retrieved successfully', {
      works: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all works error:', error);
    return response.response(res, true, 500, 'Error retrieving works', {
      error: error.message,
    });
  }
};
