import express from 'express'
import { getAccounts, getAccount, postAccount } from '../controllers/accountController.js'

const router = express.Router();

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', postAccount);

export default router;