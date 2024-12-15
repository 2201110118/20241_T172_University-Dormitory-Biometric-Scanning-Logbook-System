import express from 'express';
import { loginStudent, loginWithGoogle } from '../controllers/loginControllerStudent.js';

const router = express.Router();

router.post('/student', loginStudent);
router.post('/student/google', loginWithGoogle);

export default router; 