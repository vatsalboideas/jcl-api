const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactUs.controller');
const decryptionMiddleware = require('../middlewares/transport.decryption.middlware');

// Create contact form submission
router.post('/', decryptionMiddleware, ContactController.createContact);

// Get all contact forms with pagination
router.get('/', ContactController.getAllContacts);

// Get specific contact form by ID
router.get('/:contactId', ContactController.getContactById);

// Update contact form
// router.put("/:contactId", ContactController.updateContact);

// Delete contact form
// router.delete("/:contactId", ContactController.deleteContact);

module.exports = router;
