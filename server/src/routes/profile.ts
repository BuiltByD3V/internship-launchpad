import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', upsertProfile);

export default router;
