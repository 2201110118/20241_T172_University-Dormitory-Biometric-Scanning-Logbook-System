import express from 'express';
import { getStudents, getStudent, postStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

// Get all students
router.get('/', getStudents);

// Get a student by ID
router.get('/:id', getStudent);

// Add a new student
router.post('/', postStudent);

// Update a student by ID
router.patch('/:id', updateStudent);

// Delete a student by ID
router.delete('/:id', deleteStudent);

export default router;
