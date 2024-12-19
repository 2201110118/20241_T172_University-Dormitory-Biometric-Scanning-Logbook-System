import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFGenerator {
    constructor() {
        this.browser = null;
        this.reportsDir = path.resolve(process.cwd(), 'server', 'reports');
    }

    async initialize() {
        try {
            await this._ensureReportsDirectory();
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox']
            });
            console.log('PDF Generator initialized');
            return true;
        } catch (error) {
            console.error('PDF Generator initialization error:', error);
            return false;
        }
    }

    async _ensureReportsDirectory() {
        try {
            await fs.access(this.reportsDir);
        } catch (error) {
            await fs.mkdir(this.reportsDir, { recursive: true });
            console.log('Reports directory created at:', this.reportsDir);
        }
    }

    async generatePDF(html, options = {}) {
        const page = await this.browser.newPage();
        try {
            await page.setContent(html);
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '100px',
                    right: '20px',
                    bottom: '60px',
                    left: '20px'
                },
                printBackground: true,
                displayHeaderFooter: true,
                ...options
            });

            const fileName = options.fileName || `report_${Date.now()}.pdf`;
            const filePath = path.join(this.reportsDir, fileName);
            await fs.writeFile(filePath, pdfBuffer);

            return {
                success: true,
                fileName,
                filePath,
                buffer: pdfBuffer
            };
        } finally {
            await page.close();
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

const pdfGenerator = new PDFGenerator();
await pdfGenerator.initialize();

export default pdfGenerator; 