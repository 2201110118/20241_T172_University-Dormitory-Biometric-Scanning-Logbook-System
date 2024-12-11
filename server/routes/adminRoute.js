import express from 'express';
import { getAdmins, getAdmin, postAdmin, updateAdmin, deleteAdmin, loginAdmin, changePassword, changeUsername, getAdminDetails, confirmAdmin } from '../controllers/adminController.js';

const router = express.Router();

// Add a specific signup route
router.post('/signup', postAdmin);

// Get all admins
router.get('/', getAdmins);

// Get an admin by ID
router.get('/:id', getAdmin);

// Get admin details by ID
router.get('/details/:id', getAdminDetails);

// Add a new admin
router.post('/', postAdmin);

// Update an admin by ID
router.patch('/:id', updateAdmin);

// Delete an admin by ID
router.delete('/:id', deleteAdmin);

// Change password
router.put('/change-password/:id', changePassword);

// Change username
router.put('/change-username/:id', changeUsername);

// Add the confirmation route
router.put('/confirm/:id', confirmAdmin);

export default router;
