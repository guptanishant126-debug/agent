import { Router } from 'express';
import { getUserHistory } from '../controllers/historyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getUserHistory);

export default router;

