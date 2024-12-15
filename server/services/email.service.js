import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.config.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport(emailConfig);
    }

    async initialize() {
        try {
            await this.transporter.verify();
            console.log('Email service ready');
            return true;
        } catch (error) {
            console.error('Email service error:', error);
            return false;
        }
    }

    async sendEmail(to, subject, text, html) {
        try {
            const mailOptions = {
                from: {
                    name: 'BUKSU Dormitory System',
                    address: emailConfig.auth.user
                },
                to,
                subject,
                text,
                html: html || text,
                headers: {
                    'X-Priority': '1 (Highest)',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'high',
                    'Organization': 'Bukidnon State University',
                    'X-Mailer': 'BUKSU Dormitory System'
                }
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Send email error:', error);
            throw new Error(error.message || 'Failed to send email');
        }
    }

    getEmailTemplate(template, data) {
        const baseTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #003366;">BUKSU Dormitory System</h1>
                </div>
                <div style="color: #444; line-height: 1.6;">
                    ${this._getTemplateContent(template, data)}
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                    <p>This is an official email from the BUKSU Dormitory System.</p>
                    <p>Please do not reply to this email. If you have any questions, please contact the dormitory administration.</p>
                </div>
            </div>
        `;

        return {
            subject: this._getTemplateSubject(template, data),
            content: {
                text: this._getTemplatePlainText(template, data),
                html: baseTemplate
            }
        };
    }

    _getTemplateSubject(template, data) {
        switch (template) {
            case 'welcome':
                return 'Welcome to BUKSU Dormitory System';
            case 'notification':
                return 'Important Notice from BUKSU Dormitory';
            default:
                return 'BUKSU Dormitory System Notification';
        }
    }

    _getTemplateContent(template, data) {
        switch (template) {
            case 'welcome':
                return `
                    <h2>Welcome to BUKSU Dormitory!</h2>
                    <p>Dear ${data.name},</p>
                    <p>Your account has been successfully created in the BUKSU Dormitory System.</p>
                    <p>We're excited to have you as part of our community!</p>
                `;
            case 'notification':
                return `
                    <h2>Important Notice</h2>
                    <p>${data.message}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                `;
            default:
                return data.message || '';
        }
    }

    _getTemplatePlainText(template, data) {
        // Plain text version of the email for better deliverability
        switch (template) {
            case 'welcome':
                return `
Welcome to BUKSU Dormitory!

Dear ${data.name},

Your account has been successfully created in the BUKSU Dormitory System.
We're excited to have you as part of our community!

Best regards,
BUKSU Dormitory Administration
                `.trim();
            case 'notification':
                return `
Important Notice from BUKSU Dormitory

${data.message}

Time: ${new Date().toLocaleString()}

Best regards,
BUKSU Dormitory Administration
                `.trim();
            default:
                return data.message || '';
        }
    }
}

const emailService = new EmailService();
await emailService.initialize();

export default emailService; 