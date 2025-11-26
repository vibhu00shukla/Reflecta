// services/cbt.service.js
const CBTModel = require('../models/cbt.model');
const Journal = require('../models/journal.model');
const mongoose = require('mongoose');

/**
 * saveAnalysis({ journalId, userId, analysis })
 * - analysis is the object returned by ai.service.analyzeText()
 * - creates CBTModel doc and updates Journal.analysis.summary + keywords
 */
module.exports.saveAnalysis = async ({ journalId, userId, analysis }) => {
  if (!journalId || !userId || !analysis) {
    throw new Error('journalId, userId and analysis are required');
  }

  // normalize / safe defaults
  const doc = {
    journalId: mongoose.Types.ObjectId(journalId),
    userId: mongoose.Types.ObjectId(userId),
    negativeThoughts: Array.isArray(analysis.negativeThoughts) ? analysis.negativeThoughts : [],
    emotions: Array.isArray(analysis.emotions) ? analysis.emotions : [],
    distortions: Array.isArray(analysis.distortions) ? analysis.distortions : [],
    evidenceForThoughts: Array.isArray(analysis.evidenceForThoughts) ? analysis.evidenceForThoughts : [],
    evidenceAgainstThoughts: Array.isArray(analysis.evidenceAgainstThoughts) ? analysis.evidenceAgainstThoughts : [],
    reframes: Array.isArray(analysis.reframes) ? analysis.reframes : [],
    suggestedActions: Array.isArray(analysis.suggestedActions) ? analysis.suggestedActions : [],
    worksheetPrefill: (analysis.worksheetPrefill && typeof analysis.worksheetPrefill === 'object') ? analysis.worksheetPrefill : {},
    analysisVersion: analysis.analysisVersion || null
  };

  const created = await CBTModel.create(doc);

  // also update Journal.analysis.summary + keywords if provided
  const journalUpdate = {};
  if (analysis.summary) journalUpdate['analysis.summary'] = analysis.summary;
  if (Array.isArray(analysis.keywords) && analysis.keywords.length) journalUpdate['analysis.keywords'] = analysis.keywords;

  if (Object.keys(journalUpdate).length) {
    try {
      await Journal.findByIdAndUpdate(journalId, { $set: journalUpdate }, { new: true });
    } catch (err) {
      // non-fatal; analysis is saved even if journal update fails
      console.warn('cbt.service: failed to update Journal.analysis', err);
    }
  }

  return created.toObject ? created.toObject() : created;
};

/**
 * getByJournal(userId, journalId)
 * - returns the CBTModel for that journal if it belongs to user
 */
module.exports.getByJournal = async (userId, journalId) => {
  if (!userId || !journalId) return null;
  const doc = await CBTModel.findOne({ journalId, userId }).lean();
  return doc;
};

/**
 * listByUser(userId, { page, limit })
 * - paginated list
 */
module.exports.listByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    CBTModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    CBTModel.countDocuments({ userId })
  ]);

  return { items, total, page: p, limit: l };
};

/**
 * acceptReframe(userId, analysisId, reframeIndex)
 * - marks the specific reframe object at reframeIndex as acceptedByUser: true
 */
module.exports.acceptReframe = async (userId, analysisId, reframeIndex) => {
  if (!userId || !analysisId || (typeof reframeIndex !== 'number')) {
    throw new Error('userId, analysisId and reframeIndex required');
  }

  const analysis = await CBTModel.findOne({ _id: analysisId, userId });
  if (!analysis) {
    throw new Error('Analysis not found');
  }

  if (!Array.isArray(analysis.reframes)) analysis.reframes = [];

  if (reframeIndex < 0 || reframeIndex >= analysis.reframes.length) {
    throw new Error('Invalid reframeIndex');
  }

  // set acceptedByUser flag (create field if missing)
  analysis.reframes[reframeIndex].acceptedByUser = true;
  analysis.markModified('reframes');
  const updated = await analysis.save();

  return updated.toObject ? updated.toObject() : updated;
};
