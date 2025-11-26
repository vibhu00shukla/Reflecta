const { validationResult } = require('express-validator');
const journalService = require('../services/journal.service');

module.exports.createJournal = async (req, res, next) => {
  try {
    // if you're using express-validator on the route, check results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id; // used to associate journal with user
    const data = req.body; // { entryText, moodScore?, tags?, promptType? }

    // service should save journal and enqueue AI job (so controller doesn't wait)
    const journal = await journalService.createJournal(userId, data);

    return res.status(201).json({ message: 'Journal saved', journal });

  } catch (err) {
    next(err);
  }
};

module.exports.getJournals = async (req, res, next) => { 
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1; //
    const limit = parseInt(req.query.limit, 10) || 20;//

    const result = await journalService.getUserJournals(userId, { page, limit });//
    // result expected: { items, total, page, limit }
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports.getJournal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const journalId = req.params.id;

    const journal = await journalService.getJournalById(userId, journalId);//
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    return res.status(200).json({ journal });
  } catch (err) {
    next(err);
  }
};

module.exports.updateJournal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const journalId = req.params.id;
    const updates = req.body; // partial fields

    // service should enforce ownership and re-enqueue AI if entryText changed
    const updated = await journalService.updateJournal(userId, journalId, updates);

    return res.status(200).json({ message: 'Journal updated', journal: updated });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteJournal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const journalId = req.params.id;

    await journalService.deleteJournal(userId, journalId);
    return res.status(200).json({ message: 'Journal deleted' });
  } catch (err) {
    next(err);
  }
};
