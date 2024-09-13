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

            // Create the new submission object
            const newSubmission = {
                submission_id: submissionId,
                job_id: jobId,
                submitted_timestamp: row['Time Stamp'],
                status: "task_submitted",
                repo_link: row['Github Repository Link'],
                time_taken: row['How much time did you take to complete the task?'],
                video_link: row['Please record a video introducing yourself. We also want to hear your thoughts on your recently completed assignment. Keep the video under 2 minutes. Mention the following points in the video:\n1. Introduce yourself. You can include:\n      a. Personal details like name, education, hobbies, etc.      \n      b. Will you be available for a full-time internship for 6 months?\n2. What was the most challenging part of the assignment?\n3. If you were to change anything about the assignment, what would it be?'],
                resume_link: row['Resume'],
                Review: [],
                last_updated: new Date()
            };

            // Find existing candidate by email
            let candidateId;
            let existingCandidate = await Candidate.findOne({ email: row['Email'] });

            if (existingCandidate) {
                // Candidate exists - append submission
                candidateId = existingCandidate.candidate_id;

                // Check the last submission's timestamp for "reapplied_status"
                const lastSubmission = existingCandidate.submission[existingCandidate.submission.length - 1];
                let reappliedTimeGap = null;
                if (lastSubmission) {
                    const lastTimestamp = new Date(lastSubmission.submitted_timestamp);
                    const currentTimestamp = new Date(newSubmission.submitted_timestamp);
                    const timeDifference = (currentTimestamp - lastTimestamp) / (1000 * 60 * 60 * 24); // Difference in days
                    reappliedTimeGap = timeDifference;
                }

                // Check if all required URLs are present to determine hiring eligibility
                const currentHiringEligibility = !!(row['Github Repository Link'] && row['Resume'] && row['Please record a video introducing yourself. We also want to hear your thoughts on your recently completed assignment. Keep the video under 2 minutes. Mention the following points in the video:\n1. Introduce yourself. You can include:\n      a. Personal details like name, education, hobbies, etc.      \n      b. Will you be available for a full-time internship for 6 months?\n2. What was the most challenging part of the assignment?\n3. If you were to change anything about the assignment, what would it be?']);

                existingCandidate.submission.push(newSubmission);
                existingCandidate.current_status = "task_submitted";
                existingCandidate.current_job_id = jobId;
                existingCandidate.reapplied_time_gap = reappliedTimeGap;
                existingCandidate.current_hiring_eligibility = currentHiringEligibility;

                await existingCandidate.save();
                console.log(`Updated candidate ${existingCandidate.full_name} with new submission.`);
            } else {
                // New candidate
                candidateId = uuidv4(); // Generate unique candidate_id

                // Check if all required URLs are present for a new candidate
                const currentHiringEligibility = !!(row['Github Repository Link'] && row['Resume'] && row['Please record a video introducing yourself. We also want to hear your thoughts on your recently completed assignment. Keep the video under 2 minutes. Mention the following points in the video:\n1. Introduce yourself. You can include:\n      a. Personal details like name, education, hobbies, etc.      \n      b. Will you be available for a full-time internship for 6 months?\n2. What was the most challenging part of the assignment?\n3. If you were to change anything about the assignment, what would it be?']);

                const newCandidate = new Candidate({
                    candidate_id: candidateId,
                    email: row['Email'],
                    mobile_number: row['Contact Number'],
                    full_name: row['Full Name'],
                    college_name: row['College Name'],
                    year_of_passing: row['Year of Passing'],
                    current_status: "task_submitted",
                    reapplied_time_gap: null,  // No reapplied status for new candidates
                    current_hiring_eligibility: currentHiringEligibility,
                    current_job_id: jobId,
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
