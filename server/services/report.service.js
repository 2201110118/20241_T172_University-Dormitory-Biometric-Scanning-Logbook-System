import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportService {
    constructor() {
        this.browser = null;
        this.reportsDir = path.join(__dirname, '../reports');
    }

    async initialize() {
        try {
            // Create reports directory if it doesn't exist
            await fs.mkdir(this.reportsDir, { recursive: true });
            
            // Launch browser instance
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox']
            });
            console.log('Report service initialized');
            return true;
        } catch (error) {
            console.error('Report service initialization error:', error);
            return false;
        }
    }

    async generateStudentReport(data) {
        const page = await this.browser.newPage();
        try {
            // Filter students based on status
            let students = data.students;
            if (data.filters.status === 'active') {
                students = students.filter(student => student.registeredaccount);
            } else if (data.filters.status === 'inactive') {
                students = students.filter(student => !student.registeredaccount);
            }

            // Generate HTML content
            const html = this._generateStudentReportHTML({
                ...data,
                students,
                reportType: data.filters.status || 'all'
            });
            await page.setContent(html);

            // Generate PDF with adjusted margins
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '100px',     // Increased top margin to avoid header overlap
                    right: '20px',
                    bottom: '60px',   // Increased bottom margin for footer
                    left: '20px'
                },
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: this._generateHeader(`Student Report - ${data.filters.status || 'All'} Students`),
                footerTemplate: this._generateFooter(),
            });

            // Save PDF to file
            const fileName = `student_report_${data.filters.status || 'all'}_${Date.now()}.pdf`;
            const filePath = path.join(this.reportsDir, fileName);
            await fs.writeFile(filePath, pdfBuffer);

            return {
                success: true,
                fileName,
                filePath
            };
        } catch (error) {
            console.error('Error generating student report:', error);
            throw new Error('Failed to generate student report');
        } finally {
            await page.close();
        }
    }

    async downloadReport(fileName) {
        try {
            const filePath = path.join(this.reportsDir, fileName);
            
            // Check if file exists
            await fs.access(filePath);
            
            // Read file
            const fileBuffer = await fs.readFile(filePath);
            
            // Delete file after reading
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

    async generateLogbookReport(data) {
        const page = await this.browser.newPage();
        try {
            // Generate HTML content
            const html = this._generateLogbookReportHTML(data);
            await page.setContent(html);

            // Generate PDF with adjusted margins (similar to student report)
            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                margin: {
                    top: '100px',     // Increased top margin to avoid header overlap
                    right: '20px',
                    bottom: '60px',   // Increased bottom margin for footer
                    left: '20px'
                },
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: this._generateHeader('Logbook Report'),
                footerTemplate: this._generateFooter(),
            });

            // Save PDF to file
            const fileName = `logbook_report_${Date.now()}.pdf`;
            const filePath = path.join(this.reportsDir, fileName);
            await fs.writeFile(filePath, pdfBuffer);

            return {
                success: true,
                fileName,
                filePath
            };
        } catch (error) {
            console.error('Error generating logbook report:', error);
            throw new Error('Failed to generate logbook report');
        } finally {
            await page.close();
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
                        padding-top: 20px; /* Add padding to the top of the content */
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
                    }
                    .student-info { 
                        margin-bottom: 20px; 
                    }
                    .section { 
                        margin-bottom: 30px;
                    }
                    /* Add any additional styles you need */
                </style>
            </head>
            <body>
                <div class="section">
                    <h3>Student Information</h3>
                    <table>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Room Number</th>
                            <th>Status</th>
                        </tr>
                        ${data.students.map(student => `
                            <tr>
                                <td>${student.studentid}</td>
                                <td>${student.fullname?.firstname} ${student.fullname?.lastname}</td>
                                <td>${student.roomnumber || 'N/A'}</td>
                                <td>${student.registeredaccount ? 'Active' : 'Inactive'}</td>
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
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .section { margin-bottom: 30px; }
                </style>
            </head>
            <body>
                <div class="section">
                    <h3>Logbook Entries</h3>
                    <table>
                        <tr>
                            <th>Date</th>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Status</th>
                        </tr>
                        ${data.logs.map(log => `
                            <tr>
                                <td>${new Date(log.date).toLocaleDateString()}</td>
                                <td>${log.student?.studentid || 'N/A'}</td>
                                <td>${log.student?.fullname?.firstname} ${log.student?.fullname?.lastname}</td>
                                <td>${log.timeIn || 'N/A'}</td>
                                <td>${log.timeOut || 'N/A'}</td>
                                <td>${log.status || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Create and initialize report service
const reportService = new ReportService();
await reportService.initialize();

export default reportService; 