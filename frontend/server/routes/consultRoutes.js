import { Router } from 'express';
import { handleConsultation } from '../controllers/consultController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticateToken, upload.single('media'), handleConsultation);

export default router;

