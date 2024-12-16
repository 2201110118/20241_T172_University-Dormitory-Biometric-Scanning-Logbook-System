import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: true
    },
    dkim: {
        domainName: "buksu.edu.ph"
    }
}; 