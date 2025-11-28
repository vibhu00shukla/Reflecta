// worker.js
// Background worker that processes pending journal analysis jobs.
// Run this separately using: node worker.js

const mongoose = require('mongoose');
require('dotenv').config();

const queue = require('./src/utils/queue');
const journalModel = require('./src/models/journal.model');
const cbtService = require('./src/services/cbt.service');
const aiService = require('./src/services/ai.service');

// 1. Connect to MongoDB
async function connectDB() {
  await mongoose.connect(process.env.dbUrl);
  console.log("Worker connected to MongoDB");
}

// 2. Process a single job
async function processJob(job) {
  console.log(`Processing job ${job._id} for journal ${job.journalId}...`);

  // Claim job (mark as processing)
  const claimed = await queue.markJobProcessing(job._id);
  if (!claimed) {
    console.log("Job already taken by another worker. Skipping.");
    return;
  }

  try {
    // Fetch journal
    const journal = await journalModel.findById(job.journalId);
    if (!journal) throw new Error("Journal not found!");

    // Call AI service
    const analysis = await aiService.analyzeText(journal.entryText);

    // Save the CBTModel
    await cbtService.saveAnalysis({
      journalId: journal._id,
      userId: journal.userId,
      analysis
    });

    // Mark job done
    await queue.markJobDone(job._id);
    console.log(`Job ${job._id} completed.`);

  } catch (err) {
    console.error("Job failed:", err);
    await queue.markJobFailed(job._id, err);
  }
}

// 3. Poll loop
async function workLoop() {
  while (true) {
    try {
      const jobs = await queue.getPendingJobs(5); // get up to 5 jobs at once

      if (jobs.length === 0) {
        await new Promise(res => setTimeout(res, 3000)); // sleep 3 sec
        continue;
      }

      for (const job of jobs) {
        await processJob(job);
      }

    } catch (err) {
      console.error("Worker loop error:", err);
      await new Promise(res => setTimeout(res, 5000)); // slow down on crash
    }
  }
}

// Start worker function
const startWorker = async () => {
  try {
    await connectDB();
    console.log("Worker started successfully");
    workLoop(); // Start the loop without awaiting it to allow non-blocking execution if needed, 
    // but since we want it to run in background, we just call it.
    // However, in this single-process model, we might want to ensure it doesn't block the event loop.
    // The workLoop is async and uses await inside, so it returns a promise and yields control.
  } catch (err) {
    console.error("Failed to start worker:", err);
  }
};

// If running directly (node worker.js)
if (require.main === module) {
  startWorker();
}

module.exports = { startWorker };
