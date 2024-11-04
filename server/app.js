// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Initialize the Express application
const app = express();

// Load environment variables from .env file
dotenv.config();

// Define the port to run the server
const port = process.env.PORT;

// Middleware to parse JSON request bodies
app.use(express.json());

// Import route modules for handling student and admin routes
import studentRoute from './routes/studentRoute.js';
import adminRoute from './routes/adminRoute.js';

// Define API routes
app.use('/api/admin', adminRoute);   // Admin API routes
app.use('/api/student', studentRoute); // Student API routes

// Connect to the MongoDB database using the URI from environment variables
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
