const XLSX = require('xlsx');
const Candidate = require('../models/candidate');
const { v4: uuidv4 } = require('uuid'); // Import UUID function

const uploadExcelFile = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file was uploaded.');
        }

        const jobId = req.body.jobId;
        const excelFile = req.files.file;
        const workbook = XLSX.read(excelFile.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet); 

        for (const row of rows) {
            const submissionId = uuidv4(); // Generate unique submission_id

            const newSubmission = {
                submission_id: submissionId,
                job_id: jobId,
                submitted_timestamp: row['Time Stamp'],
                status: "task_submitted",
                repo_link: row['Github Repository Link'],
                time_taken: row['How much time did you take to complete the task?'],
                video_link: row[ 'Please record a video introducing yourself. We also want to hear your thoughts on your recently completed assignment. Keep the video under 2 minutes. Mention the following points in the video:\n1. Introduce yourself. You can include:\n      a. Personal details like name, education, hobbies, etc.      \n      b. Will you be available for a full-time internship for 6 months?\n2. What was the most challenging part of the assignment?\n3. If you were to change anything about the assignment, what would it be?'],
                resume_link: row['Resume'],
                code_review_overall_score: null,
                code_review_overall_summary: null,
                code_review_parameters_summary: {
                    code_cleanliness: { score: null, reason: null },
                    best_practices: { score: null, reason: null },
                    edge_cases: { score: null, reason: null }
                },
                resume_review: {   
                    resume_review_overall_score: null,
                    resume_review_overall_summary: null,
                    resume_review_parameters_summary: {
                        skill_match: { rating: null, reason: null },
                        work_experience_or_projects: { rating: null, reason: null },
                        project_quality: { rating: null, reason: null }
                    }
                },
                code_coverge_score: null,
                code_coverage_description: null,
                Review: [],
                last_updated: new Date()
            };

            let candidateId;
            let existingCandidate = await Candidate.findOne({ email: row['Email'] });

            if (existingCandidate) {
                candidateId = existingCandidate.candidate_id;
                existingCandidate.submission.push(newSubmission);
                existingCandidate.current_status = "task_submitted";
                await existingCandidate.save();
                console.log(`Updated candidate ${existingCandidate.full_name} with new submission.`);
            } else {
                candidateId = uuidv4(); // Generate unique candidate_id
                const newCandidate = new Candidate({
                    candidate_id: candidateId,
                    email: row['Email'],
                    mobile_number: row['Contact Number'],
                    full_name: row['Full Name'], // Corrected full_name field
                    college_name: row['College Name'],
                    year_of_passing: row['Year of Passing'],
                    current_status: "task_submitted",
                    current_hiring_eligibility: true,
                    submission: [newSubmission]
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
