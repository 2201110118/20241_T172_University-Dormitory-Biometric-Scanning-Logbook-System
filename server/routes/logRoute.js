import express from 'express';
import { getLogs, deleteLog } from '../controllers/logController.js';

const router = express.Router();

router.get('/', getLogs);

router.delete('/:logid', deleteLog);

export default router;