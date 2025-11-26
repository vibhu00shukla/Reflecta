// routes/journal.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');

const router = express.Router();
const journalController = require('../controllers/journal.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create journal
router.post(
  '/',
  authMiddleware.authUser,
  [ body('entryText').trim().notEmpty().withMessage('entryText is required'),
    body('moodScore').optional().isInt({ min: 1, max: 10 }).withMessage('moodScore 1-10'),
    body('tags').optional().isArray()
  ],
  journalController.createJournal
);

// List journals
router.get(
  '/',
  authMiddleware.authUser,
  [ query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1 }) ],
  journalController.getJournals
);

// Get single journal
router.get(
  '/:id',
  authMiddleware.authUser,
  [ param('id').notEmpty() ],
  journalController.getJournal
);

// Update journal
router.patch(
  '/:id',
  authMiddleware.authUser,
  [
    param('id').notEmpty(),
    body('entryText').optional().trim().notEmpty(),
    body('moodScore').optional().isInt({ min: 1, max: 10 }),
    body('tags').optional().isArray()
  ],
  journalController.updateJournal
);

// Delete journal
router.delete(
  '/:id',
  authMiddleware.authUser,
  [ param('id').notEmpty() ],
  journalController.deleteJournal
);

module.exports = router;
