import express from 'express';
import { getStudents, getStudent, postStudent, updateStudent, deleteStudent, checkGoogleStudent, loginWithGoogle, getStudentByStudentId } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents);

router.get('/:id', getStudent);

router.get('/studentid/:studentid', getStudentByStudentId);

router.post('/', postStudent);

router.patch('/:id', updateStudent);

router.delete('/:id', deleteStudent);

// Google auth routes
router.post('/check-google', checkGoogleStudent);
router.post('/login/google', loginWithGoogle);

export default router;
