import Admin from '../models/admin.js';

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username, password }); // Debug log

        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }

        // Find admin by username
        const admin = await Admin.findOne({ username }).select('+password');
        console.log('Found admin:', admin); // Debug log

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Simple password check
        if (admin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            admin: {
                id: admin._id,
                username: admin.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { loginAdmin };
