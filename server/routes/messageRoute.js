import express from 'express';
import { getMessages, getMessage, deleteMessage, updateMessage, createMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);

router.get('/:id', getMessage);

router.post('/', createMessage);

router.delete('/:id', deleteMessage);

router.put('/:id', updateMessage);

export default router;