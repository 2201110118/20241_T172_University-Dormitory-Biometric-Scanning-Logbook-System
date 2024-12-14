import express from 'express';
const router = express.Router();

// Check if user is authenticated
router.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json({
            isAuthenticated: true,
            userType: req.session.userType,
            user: req.session.user
        });
    } else {
        res.json({
            isAuthenticated: false,
            userType: null,
            user: null
        });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ message: 'Error logging out', error: err });
        } else {
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        }
    });
});

export default router; 