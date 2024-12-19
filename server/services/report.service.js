import pdfGenerator from '../utils/pdfGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportService {
    constructor() {
        this.reportsDir = path.resolve(process.cwd(), 'server', 'reports');
    }

    async generateStudentReport(data) {
        try {
            // Filter students based on status
            let students = data.students;
            if (data.filters.status === 'active') {
                students = students.filter(student => student.registeredaccount);
            } else if (data.filters.status === 'inactive') {
                students = students.filter(student => !student.registeredaccount);
            }

            const html = this._generateStudentReportHTML({
                ...data,
                students,
                reportType: data.filters.status || 'all'
            });

            const fileName = `student_report_${data.filters.status || 'all'}_${Date.now()}.pdf`;
            const result = await pdfGenerator.generatePDF(html, {
                fileName,
                headerTemplate: this._generateHeader(`Student Report - ${data.filters.status || 'All'} Students`),
                footerTemplate: this._generateFooter()
            });

            return {
                success: true,
                fileName: result.fileName,
                filePath: result.filePath
            };
        } catch (error) {
            console.error('Error generating student report:', error);
            throw new Error('Failed to generate student report');
        }
    }

    async generateLogbookReport(data) {
        try {
            const html = this._generateLogbookReportHTML(data);
            const fileName = `logbook_report_${Date.now()}.pdf`;

            const result = await pdfGenerator.generatePDF(html, {
                fileName,
                landscape: true,
                headerTemplate: this._generateHeader('Logbook Report'),
                footerTemplate: this._generateFooter()
            });

            return {
                success: true,
                fileName: result.fileName,
                filePath: result.filePath
            };
        } catch (error) {
            console.error('Error generating logbook report:', error);
            throw new Error('Failed to generate logbook report');
        }
    }

    async downloadReport(fileName) {
        try {
            const filePath = path.join(this.reportsDir, fileName);
            await fs.access(filePath);
            const fileBuffer = await fs.readFile(filePath);
            await fs.unlink(filePath).catch(console.error);
            
            return {
                success: true,
                buffer: fileBuffer,
                contentType: 'application/pdf'
            };
        } catch (error) {
            console.error('Error downloading report:', error);
            throw new Error('Failed to download report');
        }
    }

    _generateHeader(title) {
        return `
            <div style="font-size: 10px; padding: 20px 20px 0; width: 100%; margin-bottom: 20px;">
                <div style="text-align: center; padding-bottom: 10px;">
                    <h1 style="margin: 0; color: #003366; font-size: 16px;">BUKSU Dormitory System</h1>
                    <h2 style="margin: 5px 0; color: #666; font-size: 14px;">${title}</h2>
                    <p style="margin: 0; color: #888; font-size: 10px;">Generated on: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    _generateFooter() {
        return `
            <div style="font-size: 8px; padding: 10px 20px; border-top: 1px solid #ddd; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>BUKSU Dormitory System</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            </div>
        `;
    }

    _generateStudentReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        padding-top: 20px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f4f4f4; 
                        font-weight: bold;
                    }
                    .student-info { 
                        margin-bottom: 20px; 
                    }
                    .section { 
                        margin-bottom: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="section">
                    <h3>Student Information</h3>
                    <table>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Gmail</th>
                            <th>Room Number</th>
                            <th>Status</th>
                            <th>Submission Date</th>
                            <th>Registration Date</th>
                        </tr>
                        ${data.students.map(student => `
                            <tr>
                                <td>${student.studentid}</td>
                                <td>${student.fullname?.firstname} ${student.fullname?.lastname}</td>
                                <td>${student.gmail || 'N/A'}</td>
                                <td>${student.roomnumber || 'N/A'}</td>
                                <td>${student.registeredaccount ? 'Active' : 'Inactive'}</td>
                                <td>${student.accountStatus?.submissionDate || 'N/A'}</td>
                                <td>${student.accountStatus?.verificationDate || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `;
    }

    _generateLogbookReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left;
                    }
                    th { 
                        background-color: #f4f4f4;
                        font-weight: bold;
                    }
                    .section { 
                        margin-bottom: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="section">
                    <h3>Logbook History</h3>
                    <table>
                        <tr>
                            <th>Log ID</th>
                            <th>Student ID</th>
                            <th>Full Name</th>
                            <th>Room Number</th>
                            <th>Log Type</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                        ${data.logs.map(log => `
                            <tr>
                                <td>${log.logid || 'N/A'}</td>
                                <td>${log.student?.studentid || 'N/A'}</td>
                                <td>${log.student ? `${log.student.fullname.firstname} ${log.student.fullname.lastname}` : 'N/A'}</td>
                                <td>${log.student?.roomnumber || 'N/A'}</td>
                                <td>${log.logType || 'N/A'}</td>
                                <td>${log.timestamp?.date || 'N/A'}</td>
                                <td>${log.timestamp?.time || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `;
    }
}

const reportService = new ReportService();
export default reportService; 