import express from 'express';
import { getMessages, getMessage, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);

router.get('/:id', getMessage);

router.delete('/:id', deleteMessage);

export default router;