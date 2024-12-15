import express from 'express';
import { sendSMS, checkMessageStatus } from '../controllers/sms.controller.js';

const router = express.Router();

// Route to send SMS
router.post('/send', sendSMS);

// Route to check message status
router.get('/status/:messageId', checkMessageStatus);

export default router; 