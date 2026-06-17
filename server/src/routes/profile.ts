import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profile.js';
import { allowConfiguredCors } from '../middleware/cors.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(allowConfiguredCors);
router.use(requireAuth);

router.get('/', getProfile);
router.put('/', upsertProfile);

export default router;
