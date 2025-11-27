const { validationResult } = require('express-validator');
const cbtService = require('../services/cbt.service');

module.exports.getAnalysisForJournal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const journalId = req.params.journalId;

    console.log(`[CBT Controller] Fetching analysis for journal ${journalId} user ${userId}`);

    const analysis = await cbtService.getByJournal(userId, journalId);

    if (!analysis) {
      console.log(`[CBT Controller] No analysis found for journal ${journalId}`);
    } else {
      console.log(`[CBT Controller] Found analysis for journal ${journalId}`);
    }

    return res.status(200).json({ analysis });
  } catch (err) {
    next(err);
  }
};

module.exports.listUserAnalyses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await cbtService.listByUser(userId, { page, limit });

    return res.status(200).json(result);
    // expected shape: { items, total, page, limit }
  } catch (err) {
    next(err);
  }
};

module.exports.acceptReframe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const analysisId = req.params.id;
    const { reframeIndex } = req.body;

    const updated = await cbtService.acceptReframe(userId, analysisId, reframeIndex);

    return res.status(200).json({ message: 'Reframe accepted', updated });
  } catch (err) {
    next(err);
  }
};
