// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const corsOptions = {
    origin: ["http://localhost:5001", "https://www.google.com"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
}

// Initialize the Express application
const app = express();

// Load environment variables from .env file
dotenv.config();

// Define the port to run the server
const port = process.env.PORT || 5000;

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Import route modules for handling student and admin routes
import studentRoute from './routes/studentRoute.js';
import adminRoute from './routes/adminRoute.js';
import messageRoute from './routes/messageRoute.js';
import logRoute from './routes/logRoute.js';
import loginRouteAdmin from './routes/loginRouteAdmin.js';
import loginRouteStudent from './routes/loginRouteStudent.js';
import authRoute from './routes/authRoute.js';

// Define API routes
// Auth routes
app.use('/api/auth', authRoute);
// Admin API routes
app.use('/api/admin', adminRoute);
// Student API routes  
app.use('/api/student', studentRoute);

app.use('/api/message', messageRoute);
app.use('/api/log', logRoute);

app.use('/api/login', loginRouteAdmin);
app.use('/api/login', loginRouteStudent);

// Connect to the MongoDB database using the URI from environment variables
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
