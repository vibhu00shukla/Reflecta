const mongoose = require('mongoose');

const CBTModelSchema = new mongoose.Schema({
    journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    negativeThoughts: [{
        text: { type: String, required: true, maxlength: 1000 },
        excerpt: String
    }],

    emotions: [{
        name: String,
        score: { type: Number, min: 0, max: 1 }
    }],

    distortions: [{
        distortionType: String,
        excerpt: String
    }],

    evidenceForThoughts: { type: [String], default: [] },
    evidenceAgainstThoughts: { type: [String], default: [] },

    reframes: [{
        originalThought: String,
        rationalResponse: String
    }],

    suggestedActions: [{
        text: String
    }],

    worksheetPrefill: { type: Object, default: {} },
    analysisVersion: { type: String }
}, { timestamps: true });

CBTModelSchema.index({ journalId: 1 });
CBTModelSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CBTModel', CBTModelSchema);
