// routes/cbt.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');

const router = express.Router();
const cbtController = require('../controllers/cbt.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Get analysis for a journal
router.get(
  '/journal/:journalId',
  authMiddleware.authUser,
  [ param('journalId').notEmpty() ],
  cbtController.getAnalysisForJournal
);

// List analyses by user
router.get(
  '/',
  authMiddleware.authUser,
  [ query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1 }) ],
  cbtController.listUserAnalyses
);

// Accept a reframe
router.post(
  '/:id/accept-reframe',
  authMiddleware.authUser,
  [ param('id').notEmpty(), body('reframeIndex').isInt({ min: 0 }) ],
  cbtController.acceptReframe
);

module.exports = router;
