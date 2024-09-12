const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { createJobPost, getAllJobPosts } = require('./controllers/jobPostController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// Enable CORS
app.use(cors());

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Middleware for file uploads
app.use(fileUpload());

// Route for creating a new job post
app.post('/job-post', createJobPost);

// Route for fetching all job posts
app.get('/job-posts', getAllJobPosts);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
