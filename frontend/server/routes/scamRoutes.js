import { Router } from 'express';
import { checkScamRisk, getCommunityScamAlerts } from '../controllers/scamController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate, scamCheckSchema } from '../middleware/validate.js';

const router = Router();

router.post('/check', authenticateToken, upload.single('media'), validate(scamCheckSchema), checkScamRisk);
router.get('/alerts', getCommunityScamAlerts);

export default router;

