const Candidate = require('../models/candidate');

// API to get candidates based on query parameters with pagination and sorting
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

        // Remove pagination and sorting parameters from the query object (they shouldn't be part of the filtering)
        delete query.offset;
        delete query.limit;
        delete query.sortField;
        delete query.sortOrder;

        // Build the sorting object for MongoDB's .sort() method
        const sort = {};
        sort[sortField] = sortOrder;

        // Find candidates based on the query object with pagination and sorting
        const candidates = await Candidate.find(query)
            .skip(offset)    // Skip the first 'offset' results
            .limit(limit)    // Limit the number of results to 'limit'
            .sort(sort);     // Apply sorting based on sortField and sortOrder

        // Count the total number of matching candidates for pagination purposes
        const totalCandidates = await Candidate.countDocuments(query);

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

module.exports = { getCandidates };
