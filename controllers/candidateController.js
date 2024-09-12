const Candidate = require('../models/candidate');

// API to get candidates based on query parameters with pagination (offset and limit)
const getCandidates = async (req, res) => {
    try {
        // Extract query parameters from request
        const query = { ...req.query };

        // Extract pagination parameters (offset and limit) from the request query
        const offset = parseInt(req.query.offset) || 0; // Default to 0 if not provided
        const limit = parseInt(req.query.limit) || 10;   // Default to 10 if not provided

        // Remove pagination parameters from the query object (they shouldn't be part of the filtering)
        delete query.offset;
        delete query.limit;

        // Find candidates based on the query object with pagination
        const candidates = await Candidate.find(query)
            .skip(offset)    // Skip the first 'offset' results
            .limit(limit);   // Limit the number of results to 'limit'

        // Count the total number of matching candidates for pagination purposes
        const totalCandidates = await Candidate.countDocuments(query);

        // Return the result
        res.status(200).json({
            total: totalCandidates,  
            count: candidates.length,
            data: candidates
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'An error occurred while fetching candidates.' });
    }
};

module.exports = { getCandidates };
