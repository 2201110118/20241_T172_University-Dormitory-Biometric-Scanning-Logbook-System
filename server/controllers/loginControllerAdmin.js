import Admin from '../models/admin.js';
import axios from 'axios';

const debugLog = (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[reCAPTCHA Debug] ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
};

const verifyRecaptcha = async (token) => {
    try {
        debugLog('Verifying reCAPTCHA token...');
        debugLog('Token length:', token?.length);

        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token
            }
        });

        debugLog('reCAPTCHA API Response:', response.data);

        if (!response.data.success) {
            debugLog('reCAPTCHA verification failed:', {
                'error-codes': response.data['error-codes'],
                hostname: response.data.hostname
            });
        }

        return response.data.success;
    } catch (error) {
        debugLog('reCAPTCHA verification error:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        return false;
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { username, password, recaptchaToken } = req.body;

        debugLog('Login attempt:', { username, hasRecaptchaToken: !!recaptchaToken });

        // Verify reCAPTCHA token
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            debugLog('Login rejected: reCAPTCHA verification failed');
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        debugLog('reCAPTCHA verification successful');

        // Find admin by username and include password
        const admin = await Admin.findOne({ username }).select('+password');
        if (!admin) {
            debugLog('Login rejected: Invalid credentials (user not found)');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if admin is confirmed
        if (!admin.isConfirmed) {
            debugLog('Login rejected: Account not confirmed');
            return res.status(403).json({ message: 'Account pending confirmation', isConfirmed: false });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            debugLog('Login rejected: Invalid credentials (password mismatch)');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set session data
        req.session.user = {
            id: admin._id,
            username: admin.username,
            isConfirmed: admin.isConfirmed
        };
        req.session.userType = 'admin';

        debugLog('Login successful:', { username: admin.username });

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
        debugLog('Login error:', {
            message: error.message,
            stack: error.stack
        });
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export { loginAdmin };
