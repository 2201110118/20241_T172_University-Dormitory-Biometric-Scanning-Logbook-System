import express from 'express';
import { getAdmins, getAdmin, postAdmin, updateAdmin, deleteAdmin, loginAdmin, changePassword } from '../controllers/adminController.js';

const router = express.Router();

// Get all admins
router.get('/', getAdmins);

// Get an admin by ID
router.get('/:id', getAdmin);

// Add a new admin
router.post('/', postAdmin);

// Update an admin by ID
router.patch('/:id', updateAdmin);

// Delete an admin by ID
router.delete('/:id', deleteAdmin);

// Change password
router.put('/change-password/:id', changePassword);

export default router;
