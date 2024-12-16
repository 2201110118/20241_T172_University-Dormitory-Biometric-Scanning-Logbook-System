import express from 'express';
import { sendEmail, sendWelcomeEmail, sendNotificationEmail } from '../controllers/email.controller.js';

const router = express.Router();

// Route to send custom email
router.post('/send', sendEmail);

// Route to send welcome email
router.post('/welcome', sendWelcomeEmail);

// Route to send notification email
router.post('/notify', sendNotificationEmail);

export default router; 