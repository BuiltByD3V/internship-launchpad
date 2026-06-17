import { Router } from 'express';
import { allowConfiguredCors } from '../middleware/cors.js';
import { requireAuth } from '../middleware/auth.js';
import {
  listApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applications.js';

const router = Router();

// Every route in this router requires a valid session.
router.use(allowConfiguredCors);
router.use(requireAuth);

router.get('/', listApplications);
router.post('/', createApplication);
router.get('/:id', getApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
