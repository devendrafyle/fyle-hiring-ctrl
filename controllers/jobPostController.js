const JobPost = require('../models/jobPost');

// Helper function to generate a 5-digit job ID
const generateJobId = () => {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Generates a random 5-digit number
};

// Function to create a new job post
const createJobPost = async (req, res) => {
  try {
    const { jobTitle, jobDomain, jobDesc, codeCoverage, codeReviewScore, resumeScore, is_active } = req.body;

    // Create a new job post with a generated jobId and is_active field
    const newJobPost = new JobPost({
      jobId: generateJobId(),
      jobTitle,
      jobDomain,
      jobDesc,
      codeCoverage,
      codeReviewScore,
      resumeScore,
      is_active: is_active !== undefined ? is_active : true
    });

    await newJobPost.save();
    res.status(201).json({ message: 'Job post created successfully', jobPost: newJobPost });
  } catch (error) {
    console.error('Error creating job post:', error);
    res.status(500).json({ error: 'Failed to create job post' });
  }
};

// Function to update the active status of a job post
const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { is_active } = req.body;

    const jobPost = await JobPost.findOneAndUpdate({ jobId }, { is_active }, { new: true });
    if (!jobPost) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.status(200).json({ message: 'Job status updated', jobPost });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
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

  
  
module.exports = { createJobPost, getAllJobPosts, updateJobStatus };
  

