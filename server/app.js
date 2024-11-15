// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

const corsOptions = {
    origin: ["http://localhost:5001"],
    credentials: true,
}

// Initialize the Express application
const app = express();

// Load environment variables from .env file
dotenv.config();

// Define the port to run the server
const port = process.env.PORT;

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(cors(corsOptions));

// Import route modules for handling student and admin routes
import studentRoute from './routes/studentRoute.js';
import adminRoute from './routes/adminRoute.js';
import messageRoute from './routes/messageRoute.js';
import logRoute from './routes/logRoute.js';

// Define API routes
// Admin API routes
app.use('/api/admin', adminRoute);
// Student API routes  
app.use('/api/student', studentRoute);

app.use('/api/message', messageRoute);

app.use('/api/log', logRoute);

// Connect to the MongoDB database using the URI from environment variables
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
