import reportService from '../services/report.service.js';
import Student from '../models/student.js';
import Log from '../models/log.js';
import path from 'path';
import fs from 'fs';

// Generate student report
export const generateStudentReport = async (req, res) => {
    try {
        // Get filters from query parameters
        const { roomNumber, status } = req.query;
        
        // Build filter object
        const filter = {
            archive: false
        };
        
        if (roomNumber) filter.roomnumber = roomNumber;
        if (status === 'active') filter.registeredaccount = true;
        if (status === 'inactive') filter.registeredaccount = false;

        // Fetch students based on filters
        const students = await Student.find(filter)
            .select('studentid fullname roomnumber registeredaccount gmail accountStatus')
            .sort({ studentid: 1 });

        // Generate PDF report
        const result = await reportService.generateStudentReport({
            students,
            filters: { roomNumber, status },
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Student report generated successfully',
            fileName: result.fileName,
            filePath: result.filePath
        });
    } catch (error) {
        console.error('Generate student report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate student report'
        });
    }
};

// Generate logbook report
export const generateLogbookReport = async (req, res) => {
    try {
        // Fetch all non-archived logs
        const logs = await Log.find({ archive: false })
            .populate({
                path: 'student',
                model: 'Students',
                localField: 'student',
                foreignField: 'studentid',
                select: 'studentid fullname roomnumber'
            })
            .sort({ date: -1, timeIn: -1 });

        // Generate PDF report
        const result = await reportService.generateLogbookReport({
            logs,
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Logbook report generated successfully',
            fileName: result.fileName,
            filePath: result.filePath
        });
    } catch (error) {
        console.error('Generate logbook report error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate logbook report'
        });
    }
};

// Download report
export const downloadReport = async (req, res) => {
    try {
        const { fileName } = req.params;
        
        const result = await reportService.downloadReport(fileName);
        
        if (!result.success) {
            throw new Error('Failed to download report');
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.buffer.length);

        // Send file
        res.send(result.buffer);

    } catch (error) {
        console.error('Download report error:', error);
        res.status(404).json({
            success: false,
            message: 'Report file not found'
        });
    }
}; 