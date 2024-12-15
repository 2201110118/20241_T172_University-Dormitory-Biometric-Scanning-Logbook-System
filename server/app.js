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

// Import route modules
import studentRoute from './routes/studentRoute.js';
import adminRoute from './routes/adminRoute.js';
import messageRoute from './routes/messageRoute.js';
import logRoute from './routes/logRoute.js';
import loginRouteAdmin from './routes/loginRouteAdmin.js';
import loginRouteStudent from './routes/loginRouteStudent.js';
import authRoute from './routes/authRoute.js';
import smsRoutes from './routes/sms.routes.js';
import emailRoutes from './routes/email.routes.js';

// Define API routes
app.use('/api/student', studentRoute);
app.use('/api/admin', adminRoute);
app.use('/api/auth', authRoute);
app.use('/api/message', messageRoute);
app.use('/api/log', logRoute);
app.use('/api/sms', smsRoutes);
app.use('/api/email', emailRoutes);

// Login routes - keeping both patterns for backward compatibility
app.use('/api/login', loginRouteAdmin);
app.use('/api/login', loginRouteStudent);
app.use('/api/loginAdmin', loginRouteAdmin);    // Legacy route
app.use('/api/loginStudent', loginRouteStudent); // Legacy route

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
