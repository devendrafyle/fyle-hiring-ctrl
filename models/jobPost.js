const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
  job_id: { type: String, required: true },
  job_title: { type: String, required: true },
  job_domain: { type: String, required: true },
  job_desc: { type: String, required: true },
  code_coverage: { type: Number, required: true },
  code_review_score: { type: Number, required: true },
  resume_score: { type: Number, required: true },
  github_url: {type: String, required: true},
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
