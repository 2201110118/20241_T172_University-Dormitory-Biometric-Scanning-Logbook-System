import { twilioService } from '../services/twilio.service.js';

export const sendSMS = async (req, res) => {
    try {
        const { to, message } = req.body;

        // Basic validation
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and message are required'
            });
        }

        // Format phone number (ensure it starts with +)
        const formattedNumber = to.startsWith('+') ? to : `+${to}`;

        // Send SMS
        const result = await twilioService.sendSMS(formattedNumber, message);

        if (result.success) {
            return res.status(200).json({
                success: true,
                messageId: result.messageId,
                status: result.status
            });
        } else {
            return res.status(500).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('SMS Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const checkMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: 'Message ID is required'
            });
        }

        const result = await twilioService.getMessageStatus(messageId);

        if (result.success) {
            return res.status(200).json({
                success: true,
                status: result.status
            });
        } else {
            return res.status(500).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Status Check Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 