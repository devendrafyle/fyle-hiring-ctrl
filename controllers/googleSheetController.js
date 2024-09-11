const { GoogleSpreadsheet } = require('google-spreadsheet');
const Candidate = require('../models/candidate');
const dotenv = require('dotenv');
dotenv.config();

// Google Sheets API credentials
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Function to sync Google Sheet data to MongoDB
const syncGoogleSheetToDB = async () => {
    try {
        const doc = new GoogleSpreadsheet(SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: SERVICE_ACCOUNT_EMAIL,
            private_key: PRIVATE_KEY
        });

        await doc.loadInfo(); // Loads the document properties and worksheets

        const sheet = doc.sheetsByIndex[0]; // Access the first sheet
        const rows = await sheet.getRows(); // Get all rows

        for (const row of rows) {
            const newSubmission = {
                submission_id: row.SubmissionID,
                job_id: row.JobID,
                position: row.Position,
                submitted_timestamp: row.SubmittedTimestamp,
                status: "task_submitted",
                repo_link: row.RepoLink,
                time_taken: row.TimeTaken,
                video_link: row.VideoLink,
                resume_link: row.ResumeLink,
                code_review_overall_score: null,
                code_review_overall_summary: null,
                code_review_parameters_summary: {
                    code_cleanliness: { score: null, reason: null },
                    best_practices: { score: null, reason: null },
                    edge_cases: { score: null, reason: null }
                },
                resume_review_overall_score: null,
                resume_review_overall_summary: null,
                resume_review_parameters_summary: {
                    skill_match: { rating: null, reason: null },
                    work_experience_or_projects: { rating: null, reason: null },
                    project_quality: { rating: null, reason: null }
                },
                code_coverge_score: null,
                code_coverage_description: null,
                Review: [],
                last_updated: new Date()
            };

            // Check if candidate already exists
            const existingCandidate = await Candidate.findOne({ candidate_id: row.CandidateID });

            if (existingCandidate) {
                existingCandidate.submission.push(newSubmission);
                existingCandidate.current_status = "task_submitted"; // Update status if needed
                await existingCandidate.save();
                console.log(`Updated candidate ${existingCandidate.full_name} with new submission.`);
            } else {
                // Create new candidate if not found
                const newCandidate = new Candidate({
                    candidate_id: row.CandidateID,
                    email: row.Email,
                    mobile_number: row.MobileNumber,
                    full_name: row.FullName,
                    college_name: row.CollegeName,
                    year_of_passing: row.YearOfPassing,
                    current_status: "task_submitted",
                    current_hiring_eligibility: true,
                    submission: [newSubmission]
                });
                await newCandidate.save();
                console.log(`Candidate ${newCandidate.full_name} added to DB.`);
            }
        }
    } catch (error) {
        console.error('Error syncing Google Sheet to DB:', error);
    }
};

module.exports = { syncGoogleSheetToDB };
