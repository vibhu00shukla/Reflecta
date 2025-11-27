const journalModel = require('../models/journal.model');

async function tryEnqueueAnalysis(journalId) {
  try {
    const queue = require('../utils/queue.js');
    if (queue && typeof queue.enqueueAnalysis === 'function') {
      await queue.enqueueAnalysis(journalId);
    }

  }
  catch (err) {
    console.error("Failed to enqueue analysis job:", err);
  }
}

module.exports.createJournal = async (userId, data) => {
  if (!data || !data.entryText) {
    throw new Error('entryText is required to create a journal');
  }
  const doc = {
    userId,
    entryText: data.entryText
  }

  if (typeof data.moodScore !== 'undefined') doc.moodScore = data.moodScore;
  if (Array.isArray(data.tags)) doc.tags = data.tags;
  if (data.promptType) doc.promptType = data.promptType;
  if (data.createdAt) doc.createdAt = data.createdAt;

  const journal = await journalModel.create(doc);

  tryEnqueueAnalysis(journal._id);

  return journal;
}

module.exports.getUserJournals = async (userId, { page = 1, limit = 20 } = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20)); // cap limit to 100

  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    journalModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    journalModel.countDocuments({ userId }),
  ]);

  return {
    items,
    total,
    page: p,
    limit: l,
  };
};

module.exports.getJournalById = async (userId, journalId) => {

  const journal = await journalModel.findOne({ _id: journalId, userId }).lean();
  return journal; // null if not found or not owned
};

module.exports.updateJournal = async (userId, journalId, updates) => {
  const journal = await journalModel.findOne({ _id: journalId, userId }).lean();
  return journal;
}

module.exports.updateJournal = async (userId, journalId, updates) => {
  const allowed = {};
  if (typeof updates.entryText !== 'undefined') allowed.entryText = updates.entryText;
  if (typeof updates.moodScore !== 'undefined') allowed.moodScore = updates.moodScore;
  if (Array.isArray(updates.tags)) allowed.tags = updates.tags;
  if (typeof updates.promptType !== 'undefined') allowed.promptType = updates.promptType;

  const existing = await journalModel.findOne({ _id: journalId, userId });
  if (!existing) {
    throw new Error('Journal not found or not owned by user');
  }


  const entryTextChanged = typeof allowed.entryText !== 'undefined' && allowed.entryText !== existing.entryText;

  const updated = await journalModel.findByIdAndUpdate(
    { _id: journalId, userId },
    { $set: allowed },
    { new: true, runValidators: true }
  );
  if (entryTextChanged) {
    tryEnqueueAnalysis(journalId);
  }
  return updated;
};

module.exports.deleteJournal = async (userId, journalId) => {
  const res = await journalModel.findOneAndDelete({ _id: journalId, userId });
  return res;
};
