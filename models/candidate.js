const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    submission_id: String,
    job_id: String,
    position: String,
    submitted_timestamp: String,
    status: String,
    repo_link: String,
    time_taken: String,
    video_link: String,
    resume_link: String,
    code_review_overall_score: Number,
    code_review_overall_summary: String,
    code_review_parameters_summary: {
        code_cleanliness: {
            score: Number,
            reason: String
        },
        best_practices: {
            score: Number,
            reason: String
        },
        edge_cases: {
            score: Number,
            reason: String
        }
    },
    resume_review_overall_score: Number,
    resume_review_overall_summary: String,
    resume_review_parameters_summary: {
        skill_match: {
            rating: Number,
            reason: String
        },
        work_experience: {
            rating: Number,
            reason: String
        },
        project_quality: {
            rating: Number,
            reason: String
        }
    },
    code_coverage_score: Number,
    code_coverage_description: String,
    Review: Array,
    last_updated: { type: Date, default: Date.now }
});

const candidateSchema = new Schema({
    candidate_id: String,
    email: String,
    mobile_number: String,
    full_name: String,
    college_name: String,
    year_of_passing: String,
    current_status: String,
    current_hiring_eligibility: Boolean,
    submission: [submissionSchema]
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
