const JobPost = require('../models/jobPost');

// Function to create a new job post
const createJobPost = async (req, res) => {
  try {
    const { jobTitle, jobDomain, jobDesc, codeCoverage, codeReviewScore, resumeScore } = req.body;

    // Create a new job post
    const newJobPost = new JobPost({
      jobTitle,
      jobDomain,
      jobDesc,
      codeCoverage,
      codeReviewScore,
      resumeScore
    });

    // Save the job post to the database
    await newJobPost.save();

    res.status(201).json({ message: 'Job post created successfully', jobPost: newJobPost });
  } catch (error) {
    console.error('Error creating job post:', error);
    res.status(500).json({ error: 'Failed to create job post' });
  }
};

module.exports = { createJobPost };
