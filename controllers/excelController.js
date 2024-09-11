const XLSX = require('xlsx');
const Candidate = require('../models/candidate');

const uploadExcelFile = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file was uploaded.');
        }

        const excelFile = req.files.file; // 'file' is the name of the form field
        const workbook = XLSX.read(excelFile.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet); // Convert sheet to JSON

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

            const existingCandidate = await Candidate.findOne({ candidate_id: row.CandidateID });

            if (existingCandidate) {
                // If candidate exists, add the new submission to their submission array
                existingCandidate.submission.push(newSubmission);
                existingCandidate.current_status = "AI_REVIEWED"; // Update status if needed
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
                    current_status: "AI_REVIEWED",
                    current_hiring_eligibility: true,
                    submission: [newSubmission] // Add new submission to submission array
                });
                await newCandidate.save();
                console.log(`Candidate ${newCandidate.full_name} added to DB.`);
            }
        }

        res.send('Excel file processed and data inserted into DB.');
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).send('An error occurred while processing the file.');
    }
};

module.exports = { uploadExcelFile };
