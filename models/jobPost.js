const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  jobDomain: { type: String, required: true },
  jobDesc: { type: String, required: true },
  codeCoverage: { type: Number, required: true },
  codeReviewScore: { type: Number, required: true },
  resumeScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
