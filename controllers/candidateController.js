const Candidate = require('../models/candidate');
const JobPost = require('../models/jobPost');

// API to get candidates based on query parameters with pagination, sorting, and search
const getCandidates = async (req, res) => {
    try {
        // Extract query parameters from request
        const query = { ...req.query };

        // Extract pagination parameters (offset and limit) from the request query
        const offset = parseInt(req.query.offset) || 0; // Default to 0 if not provided
        const limit = parseInt(req.query.limit) || 10;   // Default to 10 if not provided

        // Extract sorting parameters
        const sortField = req.query.sortField || 'full_name'; // Default sort field if not provided
        const sortOrder = parseInt(req.query.sortOrder) || 1; // 1 for ascending, -1 for descending

        // Extract search query (if provided)
        const search = req.query.search || '';

        // Remove pagination, sorting, and search parameters from the query object (they shouldn't be part of the filtering)
        delete query.offset;
        delete query.limit;
        delete query.sortField;
        delete query.sortOrder;
        delete query.search;

        // Build the search query using $or to match by full_name, email, or college_name
        const searchQuery = search
            ? {
                  $or: [
                      { full_name: { $regex: search, $options: 'i' } }, // Case-insensitive partial match
                      { email: { $regex: search, $options: 'i' } }, // Case-insensitive partial match
                      { college_name: { $regex: search, $options: 'i' }},
                      { mobile_number: { $regex: search, $options: 'i' }}
                  ]
              }
            : {}; // If no search term is provided, don't apply any search filter

        // Combine the search query with other query filters (if any)
        const finalQuery = { ...query, ...searchQuery };

        // Build the sorting object for MongoDB's .sort() method
        const sort = {};
        sort[sortField] = sortOrder;

        // Find candidates based on the final query object with pagination and sorting
        const candidates = await Candidate.find(finalQuery)
            .skip(offset)    // Skip the first 'offset' results
            .limit(limit)    // Limit the number of results to 'limit'
            .sort(sort);     // Apply sorting based on sortField and sortOrder

        // Count the total number of matching candidates for pagination purposes
        const totalCandidates = await Candidate.countDocuments(finalQuery);

        // Return the result
        res.status(200).json({
            total: totalCandidates,  // Total matching candidates (ignoring pagination)
            count: candidates.length, // Number of candidates returned in this batch
            data: candidates          // The candidates data
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'An error occurred while fetching candidates.' });
    }
};

const phasesList = [
    'task_submitted',
    'ongoing_ai_review',
    'ai_reviewed',
    'rejected',
    'interview_1',
    'interview_2',
    'interview_3',
    'offer_letter_sent',
    'offer_letter_accepted',
    'joined'
];

// API to get the number of candidates in each phase by job IDs, including job titles
const getCandidateStats = async (req, res) => {
    try {
        const stats = await Candidate.aggregate([
            { $unwind: '$submission' },
            {
                $group: {
                    _id: { job_id: '$submission.job_id', current_status: '$current_status' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.job_id',
                    phases: {
                        $push: {
                            phase: '$_id.current_status',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'jobposts',
                    localField: '_id',
                    foreignField: 'job_id',
                    as: 'jobDetails'
                }
            },
            { $unwind: { path: '$jobDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    job_id: '$_id',
                    phases: 1,
                    job_title: { $ifNull: ['$jobDetails.job_title', 'Unknown Job'] }
                }
            }
        ]);

        // Sanitize and ensure consistent phases for each job
        const sanitizedStats = stats.map((job) => {
            const sanitizedPhases = phasesList.map((phase) => {
                const matchingPhase = job.phases.find((p) => p.phase.toUpperCase() === phase.toUpperCase());
                return {
                    phase: phase.toUpperCase(),
                    count: matchingPhase ? matchingPhase.count : 0
                };
            });

            return {
                job_id: job.job_id,
                job_title: job.job_title,
                phases: sanitizedPhases
            };
        });

        res.status(200).json(sanitizedStats);
    } catch (error) {
        console.error('Error fetching candidate stats:', error);
        res.status(500).json({ error: 'An error occurred while fetching candidate stats.' });
    }
};

module.exports = { getCandidates, getCandidateStats };
