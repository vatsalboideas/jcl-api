const express = require('express');
const router = express.Router();
const workController = require('../controllers/work.controller');

router.post('/', workController.createWork);
router.get('/', workController.getAllWorks);
router.get('/:workId', workController.getWorkById);
router.get('/slug/:slug', workController.getWorkBySlug);
router.put('/:workId', workController.updateWork);
router.delete('/:workId', workController.deleteWork);

module.exports = router;
