import Student from '../models/student.js';
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

const loginStudent = async (req, res) => {
    try {
        const { studentid, password, captchaToken } = req.body;
        console.log('Login attempt:', { studentid }); // Don't log passwords

        // Basic validation
        if (!studentid || !password) {
            return res.status(400).json({ message: 'Please provide student ID and password' });
        }

        // Verify reCAPTCHA
        if (!captchaToken) {
            return res.status(400).json({ message: 'Please complete the reCAPTCHA verification' });
        }

        const isValidCaptcha = await verifyRecaptcha(captchaToken);
        if (!isValidCaptcha) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        }

        // Find student by studentid and include password for verification
        const student = await Student.findOne({ studentid }).select('+password');
        console.log('Found student:', student ? 'Yes' : 'No'); // Safe logging

        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password first
        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check registration and confirmation status
        if (!student.registeredaccount || !student.accountStatus.isConfirmed) {
            console.log('Student not confirmed:', studentid);
            return res.status(403).json({
                message: 'Account pending confirmation',
                isConfirmed: false
            });
        }

        // Success response
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
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const loginWithGoogle = async (req, res) => {
    try {
        const { googleId, gmail } = req.body;

        if (!googleId || !gmail) {
            return res.status(400).json({ message: 'Missing required Google authentication data' });
        }

        // Find student by Gmail
        const student = await Student.findOne({ gmail });

        if (!student) {
            return res.status(401).json({ message: 'No account found with this Gmail' });
        }

        // Update Google ID if not already set
        if (!student.googleId) {
            student.googleId = googleId;
            await student.save();
        }

        // Check registration and confirmation status
        if (!student.registeredaccount || !student.accountStatus.isConfirmed) {
            return res.status(403).json({
                message: 'Account pending confirmation',
                isConfirmed: false
            });
        }

        // Success response
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
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error during Google login' });
    }
};

export { loginStudent, loginWithGoogle }; 