const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { syncGoogleSheetToDB } = require('./controllers/googleSheetController');
const { uploadExcelFile } = require('./controllers/excelController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Middleware for file uploads
app.use(fileUpload());

// Route for syncing Google Sheets data
// app.get('/sync-google-sheet', (req, res) => {
//     syncGoogleSheetToDB();
//     res.send('Google Sheets data synced.');
// });

// Route for uploading and processing Excel file
app.post('/upload-excel', uploadExcelFile);

app.post('/job-post', createJobPost);

app.get('/', (req,res)=>{
    res.send('API is working fine');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
