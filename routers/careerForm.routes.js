// routes/careerRoutes.js
const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerForm.controller');
const jwtAuth = require('../middlewares/authentication.middleware');
const decryptionMiddleware = require('../middlewares/transport.decryption.middlware');

// Create new career form submission
router.post(
  '/',
  jwtAuth.requireWriteAccess,
  decryptionMiddleware,
  careerController.createCareer
);

// // Get all career form submissions with pagination
// router.get('/', careerController.getAllCareers);

// // Get single career form submission
// router.get('/:careerId', careerController.getCareerById);

// // Update career form submission
// router.put('/:careerId', careerController.updateCareer);

// // Delete career form submission
// router.delete('/:careerId', careerController.deleteCareer);

module.exports = router;
