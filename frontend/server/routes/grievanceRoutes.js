import { Router } from 'express';
import { generateGrievance, approveAndSubmitGrievance, listGrievances } from '../controllers/grievanceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, grievanceGenerateSchema, grievanceSubmitSchema } from '../middleware/validate.js';

const router = Router();

router.post('/generate', authenticateToken, validate(grievanceGenerateSchema), generateGrievance);
router.post('/submit', authenticateToken, validate(grievanceSubmitSchema), approveAndSubmitGrievance);
router.get('/', authenticateToken, listGrievances);

export default router;

