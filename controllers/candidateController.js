const Candidate = require('../models/candidate');

// API to get candidates based on query parameters
const getCandidates = async (req, res) => {
    try {
        // Extract query parameters from request
        const query = { ...req.query }; // Copy all query parameters to the query object

        // Find candidates based on the query object
        const candidates = await Candidate.find(query);

        // Return the result
        if (candidates.length === 0) {
            return res.status(404).json({ message: 'No candidates found matching the criteria.' });
        }

        res.status(200).json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'An error occurred while fetching candidates.' });
    }
};

module.exports = { getCandidates };
