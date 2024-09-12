const JobPost = require('../models/jobPost');

// Helper function to generate a 5-digit job ID
const generateJobId = () => {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Generates a random 5-digit number
};

// Function to create a new job post
const createJobPost = async (req, res) => {
  try {
    const { jobTitle, jobDomain, jobDesc, codeCoverage, codeReviewScore, resumeScore } = req.body;

    // Create a new job post with generated jobId
    const newJobPost = new JobPost({
      jobId: generateJobId(),
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

const getAllJobPosts = async (req, res) => {
    try {
      const jobPosts = await JobPost.find();
      res.status(200).json(jobPosts);
    } catch (error) {
      console.error('Error fetching job posts:', error);
      res.status(500).json({ error: 'Failed to fetch job posts' });
    }
  };
  
module.exports = { createJobPost, getAllJobPosts };
  

