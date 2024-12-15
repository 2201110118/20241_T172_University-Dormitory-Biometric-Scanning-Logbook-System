import Student from '../models/student.js';
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

const loginStudent = async (req, res) => {
    try {
        const { studentid, password, recaptchaToken } = req.body;

        debugLog('Login attempt:', { studentid, hasRecaptchaToken: !!recaptchaToken });

        // Verify reCAPTCHA token
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            debugLog('Login rejected: reCAPTCHA verification failed');
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        debugLog('reCAPTCHA verification successful');

        // Basic validation
        if (!studentid || !password) {
            debugLog('Login rejected: Missing credentials');
            return res.status(400).json({ message: 'Please provide student ID and password' });
        }

        // Validate student ID format
        if (isNaN(studentid) || studentid.toString().length !== 10) {
            debugLog('Login rejected: Invalid student ID format');
            return res.status(400).json({ message: 'Student ID must be a 10-digit number' });
        }

        // Find student by studentid and include password
        const student = await Student.findOne({ studentid }).select('+password');
        if (!student) {
            debugLog('Login rejected: Invalid credentials (student not found)');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password first
        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            debugLog('Login rejected: Invalid credentials (password mismatch)');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check registration and confirmation status
        if (!student.registeredaccount || !student.accountStatus.isConfirmed) {
            debugLog('Login rejected: Account not confirmed', { studentid });
            return res.status(403).json({
                message: 'Account pending confirmation',
                isConfirmed: false
            });
        }

        // Set session data
        req.session.user = {
            id: student._id,
            studentid: student.studentid,
            fullname: student.fullname,
            gmail: student.gmail,
            roomnumber: student.roomnumber,
            registeredaccount: student.registeredaccount,
            accountStatus: student.accountStatus
        };
        req.session.userType = 'student';

        debugLog('Login successful:', { studentid });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            student: {
                id: student._id,
                studentid: student.studentid,
                fullname: student.fullname,
                gmail: student.gmail,
                roomnumber: student.roomnumber,
                registeredaccount: student.registeredaccount,
                accountStatus: student.accountStatus
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
};

const loginWithGoogle = async (req, res) => {
    try {
        const { googleId, gmail, recaptchaToken } = req.body;

        debugLog('Google login attempt:', { gmail, hasRecaptchaToken: !!recaptchaToken });

        // Verify reCAPTCHA token
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            debugLog('Google login rejected: reCAPTCHA verification failed');
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        debugLog('reCAPTCHA verification successful');

        if (!googleId || !gmail) {
            debugLog('Google login rejected: Missing required data');
            return res.status(400).json({ message: 'Missing required Google authentication data' });
        }

        // Find student by Gmail
        const student = await Student.findOne({ gmail });

        if (!student) {
            debugLog('Google login rejected: No account found', { gmail });
            return res.status(401).json({ message: 'No account found with this Gmail' });
        }

        // Update Google ID if not already set
        if (!student.googleId) {
            student.googleId = googleId;
            await student.save();
            debugLog('Updated Google ID for student', { gmail });
        }

        // Check registration and confirmation status
        if (!student.registeredaccount || !student.accountStatus.isConfirmed) {
            debugLog('Google login rejected: Account not confirmed', { gmail });
            return res.status(403).json({
                message: 'Account pending confirmation',
                isConfirmed: false
            });
        }

        // Set session data
        req.session.user = {
            id: student._id,
            studentid: student.studentid,
            fullname: student.fullname,
            gmail: student.gmail,
            roomnumber: student.roomnumber,
            registeredaccount: student.registeredaccount,
            accountStatus: student.accountStatus
        };
        req.session.userType = 'student';

        debugLog('Google login successful:', { gmail });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            student: {
                id: student._id,
                studentid: student.studentid,
                fullname: student.fullname,
                gmail: student.gmail,
                roomnumber: student.roomnumber,
                registeredaccount: student.registeredaccount,
                accountStatus: student.accountStatus
            }
        });
    } catch (error) {
        debugLog('Google login error:', {
            message: error.message,
            stack: error.stack
        });
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { loginStudent, loginWithGoogle }; 