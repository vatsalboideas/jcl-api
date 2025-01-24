const express = require('express');
const router = express.Router();
const WorkDetailController = require('../controllers/workDetailsData.controller');
// const jwtAuth = require('../middlewares/authentication.middleware');

// Create new work detail
router.post(
  '/',
  // jwtAuth.requireWriteAccess,
  WorkDetailController.createWorkDetail
);

// Get all work details with pagination
router.get('/', WorkDetailController.getAllWorkDetails);

// Get specific work detail by ID
router.get('/:workDetailId', WorkDetailController.getWorkDetailById);

// Update work detail by ID
router.put(
  '/:workDetailId',
  // jwtAuth.requireWriteAccess,
  WorkDetailController.updateWorkDetail
);

// Delete work detail by ID
router.delete(
  '/:workDetailId',
  // jwtAuth.requireWriteAccess,
  WorkDetailController.deleteWorkDetail
);

module.exports = router;
