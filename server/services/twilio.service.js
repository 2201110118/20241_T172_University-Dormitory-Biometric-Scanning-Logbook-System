import twilio from 'twilio';
import { twilioConfig } from '../config/twilio.config.js';

class TwilioService {
    constructor() {
        this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    }

    async sendSMS(to, message) {
        try {
            const response = await this.client.messages.create({
                body: message,
                from: twilioConfig.phoneNumber,
                to: to
            });
            return {
                success: true,
                messageId: response.sid,
                status: response.status
            };
        } catch (error) {
            console.error('Twilio SMS Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getMessageStatus(messageSid) {
        try {
            const message = await this.client.messages(messageSid).fetch();
            return {
                success: true,
                status: message.status
            };
        } catch (error) {
            console.error('Twilio Status Check Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export const twilioService = new TwilioService(); 