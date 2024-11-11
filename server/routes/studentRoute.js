import express from 'express';
import { getStudents, getStudent, postStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents);

router.get('/:id', getStudent);

router.post('/', postStudent);

router.patch('/:id', updateStudent);

router.delete('/student/:studentid', deleteStudent);

export default router;
