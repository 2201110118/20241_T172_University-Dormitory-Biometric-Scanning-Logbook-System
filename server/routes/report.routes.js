import express from 'express';
import {
    generateStudentReport,
    generateLogbookReport,
    downloadReport
} from '../controllers/report.controller.js';

const router = express.Router();

// Generate reports
router.get('/students', generateStudentReport);
router.get('/logbook', generateLogbookReport);

// Download report
router.get('/download/:fileName', downloadReport);

export default router; 