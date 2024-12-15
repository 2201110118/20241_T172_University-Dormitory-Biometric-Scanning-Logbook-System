import express from 'express';
import { getLogs, getLog, deleteLog, updateLog, createLog } from '../controllers/logController.js';

const router = express.Router();

router.get('/', getLogs);
router.get('/:id', getLog);
router.post('/', createLog);
router.delete('/:logid', deleteLog);
router.put('/:logid', updateLog);

export default router;