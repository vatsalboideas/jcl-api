'use strict';
require('dotenv').config();
const models = require('../models/index');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const response = require('../helpers/response');

// Validation schema for career form
const careerFormSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  contactNumber: Joi.string()
    .required()
    .pattern(/^\+?[\d\s-]+$/),
  portfolioLink: Joi.string().uri().allow('').optional(),
  message: Joi.string().required().trim(),
  emailId: Joi.string().required().email(),
  resume: Joi.string().required(), // Assuming resume is a UUID reference to uploaded file
});

// Create career form submission
exports.createCareer = async (req, res) => {
  try {
    // Validate request body
    const { error } = careerFormSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    // Create career form record
    const career = await models.careerForms.create({
      careerId: uuidv4(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return response.response(
      res,
      false,
      201,
      'Career form submitted successfully',
      {
        careerId: career.careerId,
        firstName: career.firstName,
        lastName: career.lastName,
        emailId: career.emailId,
        portfolioLink: career.portfolioLink,
      }
    );
  } catch (error) {
    console.error('Career form submission error:', error);
    return response.response(res, true, 500, 'Error submitting career form', {
      error: error.message,
    });
  }
};

// Get career form by ID
exports.getCareerById = async (req, res) => {
  try {
    const { careerId } = req.params;

    const career = await models.careerForms.findOne({
      where: { careerId },
      include: [
        {
          model: models.Media,
          as: 'resumePDF',
          required: false,
          attributes: ['url'],
        },
      ],
    });

    if (!career) {
      return response.response(
        res,
        true,
        404,
        'Career form submission not found'
      );
    }

    return response.response(
      res,
      false,
      200,
      'Career form retrieved successfully',
      career
    );
  } catch (error) {
    console.error('Get career form error:', error);
    return response.response(res, true, 500, 'Error retrieving career form', {
      error: error.message,
    });
  }
};

// Update career form
exports.updateCareer = async (req, res) => {
  try {
    const { careerId } = req.params;

    // Validate request body
    const { error } = careerFormSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const career = await models.careerForms.findOne({
      where: { careerId },
    });

    if (!career) {
      return response.response(
        res,
        true,
        404,
        'Career form submission not found'
      );
    }

    // Update career form
    await career.update({
      ...req.body,
      updatedAt: new Date(),
    });

    return response.response(
      res,
      false,
      200,
      'Career form updated successfully',
      career
    );
  } catch (error) {
    console.error('Update career form error:', error);
    return response.response(res, true, 500, 'Error updating career form', {
      error: error.message,
    });
  }
};

// Delete career form
exports.deleteCareer = async (req, res) => {
  try {
    const { careerId } = req.params;

    const career = await models.careerForms.findOne({
      where: { careerId },
    });

    if (!career) {
      return response.response(
        res,
        true,
        404,
        'Career form submission not found'
      );
    }

    // Delete from database
    await career.destroy();

    return response.response(
      res,
      false,
      200,
      'Career form deleted successfully'
    );
  } catch (error) {
    console.error('Delete career form error:', error);
    return response.response(res, true, 500, 'Error deleting career form', {
      error: error.message,
    });
  }
};

// Get all career forms with pagination
exports.getAllCareers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.careerForms.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return response.response(
      res,
      false,
      200,
      'Career forms retrieved successfully',
      {
        careers: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      }
    );
  } catch (error) {
    console.error('Get all career forms error:', error);
    return response.response(res, true, 500, 'Error retrieving career forms', {
      error: error.message,
    });
  }
};
