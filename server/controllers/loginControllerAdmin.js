import Admin from '../models/admin.js';

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username }); // Don't log passwords

        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }

        // Find admin by username and include password for verification
        const admin = await Admin.findOne({ username }).select('+password');
        console.log('Found admin:', admin ? 'Yes' : 'No'); // Safe logging

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password first
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Only check confirmation status if password is correct
        if (!admin.isConfirmed) {
            console.log('Admin not confirmed:', username);
            return res.status(403).json({
                message: 'Account pending confirmation',
                isConfirmed: false
            });
        }

        // Success response
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
