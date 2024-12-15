import emailService from '../services/email.service.js';

export const sendEmail = async (req, res) => {
    try {
        const { to, subject, message, template, data } = req.body;

        let result;
        if (template) {
            // Send email using template
            result = await emailService.sendNotification(to, template, data);
        } else {
            // Send custom email
            result = await emailService.sendEmail(to, subject, message);
        }

        res.status(200).json({
            success: true,
            messageId: result.messageId,
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Email controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send email'
        });
    }
};

// Send welcome email to new student
export const sendWelcomeEmail = async (req, res) => {
    try {
        const { to, name } = req.body;
        
        const result = await emailService.sendNotification(to, 'welcome', { name });
        
        res.status(200).json({
            success: true,
            messageId: result.messageId,
            message: 'Welcome email sent successfully'
        });
    } catch (error) {
        console.error('Welcome email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send welcome email'
        });
    }
};

// Send notification email
export const sendNotificationEmail = async (req, res) => {
    try {
        const { to, message } = req.body;
        
        const result = await emailService.sendNotification(to, 'notification', { message });
        
        res.status(200).json({
            success: true,
            messageId: result.messageId,
            message: 'Notification email sent successfully'
        });
    } catch (error) {
        console.error('Notification email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send notification email'
        });
    }
}; 