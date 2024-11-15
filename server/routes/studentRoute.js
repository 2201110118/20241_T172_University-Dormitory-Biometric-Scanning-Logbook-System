import express from 'express';
import { getStudents, getStudent, postStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents);

router.get('/:id', getStudent);

router.post('/', postStudent);

router.patch('/:id', updateStudent);

router.delete('/:studentid', deleteStudent);

export default router;
