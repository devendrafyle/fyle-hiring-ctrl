const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { syncGoogleSheetToDB } = require('./controllers/googleSheetController');
const { uploadExcelFile } = require('./controllers/excelController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

app.use(fileUpload());

app.get('/sync-google-sheet', (req, res) => {
    syncGoogleSheetToDB();
    res.send('Google Sheets data synced.');
});


app.post('/upload-excel', uploadExcelFile);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
