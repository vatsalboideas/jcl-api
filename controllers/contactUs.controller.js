'use strict';
require('dotenv').config();
const models = require('../models/index');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const response = require('../helpers/response');
const { sendEmail } = require('../services/emailServices');

// Validation schema for contact form
const contactFormSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  contactNumber: Joi.string()
    .required()
    .pattern(/^\+?[\d\s-]+$/),
  subject: Joi.string().required().trim(),
  message: Joi.string().required().trim(),
  emailId: Joi.string().required().email(),
});

// Create contact form submission
exports.createContact = async (req, res) => {
  try {
    // Validate request body
    const { error } = contactFormSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    // Create contact form record
    const contact = await models.contactUsForms.create({
      contactId: uuidv4(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await sendEmail({
      subject: 'Contact Form Submission',
      template: 'contact',
      data: req.body,
    });

    return response.response(
      res,
      false,
      201,
      'Contact form submitted successfully'
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return response.response(res, true, 500, 'Error submitting contact form', {
      error: error.message,
    });
  }
};

// Get contact by ID
exports.getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await models.contactUsForms.findOne({
      where: { contactId },
    });

    if (!contact) {
      return response.response(
        res,
        true,
        404,
        'Contact form submission not found'
      );
    }

    return response.response(
      res,
      false,
      200,
      'Contact form retrieved successfully',
      contact
    );
  } catch (error) {
    console.error('Get contact error:', error);
    return response.response(res, true, 500, 'Error retrieving contact form', {
      error: error.message,
    });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    // Validate request body
    const { error } = contactFormSchema.validate(req.body);
    if (error) {
      return response.response(res, true, 400, error.details[0].message);
    }

    const contact = await models.contactUsForms.findOne({
      where: { contactId },
    });

    if (!contact) {
      return response.response(
        res,
        true,
        404,
        'Contact form submission not found'
      );
    }

    // Update contact form
    await contact.update({
      ...req.body,
      updatedAt: new Date(),
    });

    return response.response(
      res,
      false,
      200,
      'Contact form updated successfully',
      contact
    );
  } catch (error) {
    console.error('Update contact error:', error);
    return response.response(res, true, 500, 'Error updating contact form', {
      error: error.message,
    });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await models.contactUsForms.findOne({
      where: { contactId },
    });

    if (!contact) {
      return response.response(
        res,
        true,
        404,
        'Contact form submission not found'
      );
    }

    // Delete from database
    await contact.destroy();

    return response.response(
      res,
      false,
      200,
      'Contact form deleted successfully'
    );
  } catch (error) {
    console.error('Delete contact error:', error);
    return response.response(res, true, 500, 'Error deleting contact form', {
      error: error.message,
    });
  }
};

// Get all contacts with pagination
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.contactUsForms.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return response.response(
      res,
      false,
      200,
      'Contact forms retrieved successfully',
      {
        contacts: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      }
    );
  } catch (error) {
    console.error('Get all contacts error:', error);
    return response.response(res, true, 500, 'Error retrieving contact forms', {
      error: error.message,
    });
  }
};
