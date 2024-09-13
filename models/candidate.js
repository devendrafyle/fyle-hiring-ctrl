const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for resume review parameters
const resumeReviewParametersSchema = new Schema({
  skill_match: {
    rating: { type: Number },
    reason: { type: String }
  },
  work_experience: {
    rating: { type: Number },
    reason: { type: String }
  },
  project_quality: {
    rating: { type: Number },
    reason: { type: String }
  }
});

// Define the schema for resume review
const resumeReviewSchema = new Schema({
  resume_review_parameters_summary: resumeReviewParametersSchema,
  resume_review_overall_score: { type: Number },
  resume_review_overall_summary: { type: String }
});

// Define the schema for code review parameters
const codeReviewSchema = new Schema({
  implementation_closeness: { type: Number },
  code_cleanliness: { type: Number },
  best_practices: { type: Number },
  edge_cases: { type: Number },
  overall_score: { type: Number },
  summary: { type: String }
});

// Define the schema for a submission
const submissionSchema = new Schema({
  submission_id: { type: String },
  job_id: { type: String },
  position: { type: String },
  submitted_timestamp: { type: String },
  status: { type: String },
  repo_link: { type: String },
  time_taken: { type: String },
  video_link: { type: String },
  resume_link: { type: String },
  resume_review: resumeReviewSchema,
  code_review: codeReviewSchema,
  code_coverage_score: { type: Number },
  code_coverage_description: { type: String },
  Review: { type: Array },
  last_updated: { type: Date, default: Date.now }
});

const candidateSchema = new Schema({
  candidate_id: { type: String },
  email: { type: String },
  mobile_number: { type: String },
  full_name: { type: String },
  college_name: { type: String },
  year_of_passing: { type: String },
  current_status: { type: String },
  current_job_id: { type: String },
  current_hiring_eligibility: { type: Boolean },
  reapplied_time_gap: { type: String },
  submission: [submissionSchema]
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
