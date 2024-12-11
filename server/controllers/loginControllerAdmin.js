import Admin from '../models/admin.js';
import axios from 'axios';

const verifyRecaptcha = async (token) => {
    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token
            }
        });
        return response.data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { username, password, captchaToken } = req.body;

        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(captchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        // Find admin by username and include password
        const admin = await Admin.findOne({ username }).select('+password');
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if admin is confirmed
        if (!admin.isConfirmed) {
            return res.status(403).json({ message: 'Account pending confirmation', isConfirmed: false });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            admin: {
                id: admin._id,
                username: admin.username,
                isConfirmed: admin.isConfirmed
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { loginAdmin };
