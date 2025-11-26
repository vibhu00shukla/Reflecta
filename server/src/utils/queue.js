const mongoose = require('mongoose');

let AnalysisJob ;

function initModel(){ //lazy init meaning model is created only when needed
    if(AnalysisJob) return ;
    const schema = new mongoose.Schema({
    type: { type: String, required: true, default: 'analyzeJournal' },
    journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
    status: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
  }, { timestamps: true });

  AnalysisJob = mongoose.models.AnalysisJob || mongoose.model('AnalysisJob', schema);
}

async function enqueueAnalysis(journalId) {
  if (!journalId) throw new Error('journalId required');
  initModel(); 
  const doc = await AnalysisJob.create({
    journalId,
    type: 'analyzeJournal'
  });
  return doc._id.toString(); 
}

async function getPendingJobs(limit = 10) {
  initModel();
  const docs = await AnalysisJob.find({ status: 'pending' }).sort({ createdAt: 1 }).limit(limit).lean();
  return docs;
}

async function markJobProcessing(jobId) {
  initModel();
  const doc = await AnalysisJob.findOneAndUpdate(
    { _id: jobId, status: 'pending' }, // only claim if still pending
    { $set: { status: 'processing', lastError: null }, $inc: { attempts: 1 } },
    { new: true }
  ).lean(); // lean means return plain JS object because we don't need full mongoose document methods
  return doc;
}

async function markJobDone(jobId) {
  initModel();
  await AnalysisJob.findByIdAndUpdate(jobId, { $set: { status: 'done' } });
}

async function markJobFailed(jobId, err) {
  initModel();
  const message = err ? (typeof err === 'string' ? err : (err.message || String(err))) : 'unknown';
  await AnalysisJob.findByIdAndUpdate(jobId, { $set: { status: 'failed', lastError: message } });
}


async function reenqueueJob(jobId) {
  initModel();
  await AnalysisJob.findByIdAndUpdate(jobId, { $set: { status: 'pending', lastError: null } });
}

module.exports = {
  enqueueAnalysis,
  getPendingJobs,
  markJobProcessing,
  markJobDone,
  markJobFailed,
  reenqueueJob,
};