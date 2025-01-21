const express = require('express');
const router = express.Router();
const WorkDetailController = require('../controllers/workData.controller');

// Create new work detail
router.post('/', WorkDetailController.createWorkDetail);

// Get all work details (admin route)
router.get('/all', WorkDetailController.getAllWorkDetails);

// Get all details for a specific work
router.get('/work/:workId', WorkDetailController.getWorkDetails);

// Get specific work detail by ID
router.get('/:workDetailId', WorkDetailController.getWorkDetailById);

// Update work detail
router.put('/:workDetailId', WorkDetailController.updateWorkDetail);

// Delete work detail
router.delete('/:workDetailId', WorkDetailController.deleteWorkDetail);

module.exports = router;
