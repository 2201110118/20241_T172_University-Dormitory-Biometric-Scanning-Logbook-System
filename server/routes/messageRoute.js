import express from 'express';
import { getMessages, getMessage, deleteMessage, updateMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);

router.get('/:id', getMessage);

router.delete('/:id', deleteMessage);

router.put('/:id', updateMessage);

export default router;