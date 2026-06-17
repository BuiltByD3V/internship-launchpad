import { Router } from 'express';
import { allowConfiguredCors } from '../middleware/cors.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzeJob } from '../controllers/ai.js';

const router = Router();

// AI features require a logged-in user (keeps the Anthropic key behind auth).
router.use(allowConfiguredCors);
router.use(requireAuth);

router.post('/analyze', analyzeJob);

export default router;
