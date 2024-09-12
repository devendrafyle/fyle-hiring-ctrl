const JobPost = require('../models/jobPost');
const { v4: uuidv4 } = require('uuid'); 
// Function to create a new job post
const createJobPost = async (req, res) => {
  try {
    const { job_title, job_domain, job_desc, code_coverage, code_review_score, resume_score, is_active } = req.body;

    // Create a new job post with a generated jobId and is_active field
    const newJobPost = new JobPost({
      job_id: uuidv4(),
      job_title,
      job_domain,
      job_desc,
      code_coverage,
      code_review_score,
      resume_score,
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
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params; // Extract jobId from the route parameters
    const updates = req.body; // Get the updates from the request body

    // Find and update the job post with the provided updates
    const updatedJobPost = await JobPost.findOneAndUpdate({ jobId }, updates, { new: true });

    if (!updatedJobPost) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.status(200).json({ message: 'Job updated successfully', jobPost: updatedJobPost });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};


const getAllJobPosts = async (req, res) => {
  try {
      // Extract query parameters
      const { job_id, offset = 0, limit = 10, ...filters } = req.query;

      // Create the query object
      let query = {};

      // If an ID is provided, search by ID
      if (job_id) {
          query.job_id = job_id;
      }

      // Add any other filters passed as query parameters (e.g., job_domain, job_title, etc.)
      query = { ...query, ...filters };

      // Find the total count of matching documents (ignoring pagination)
      const totalCount = await JobPost.countDocuments(query);

      // Fetch the matching job posts with pagination (offset and limit)
      const jobPosts = await JobPost.find(query)
          .skip(parseInt(offset))  // Skip the number of records specified by offset
          .limit(parseInt(limit)); // Limit the number of records returned

      // Return the response in the desired format
      res.status(200).json({
          count: totalCount,
          data: jobPosts
      });
  } catch (error) {
      console.error('Error fetching job posts:', error);
      res.status(500).json({ error: 'Failed to fetch job posts' });
  }
};

  
  
module.exports = { createJobPost, getAllJobPosts, updateJob };
  

