import { Router } from 'express';
import { handleAuth } from '../middleware/auth.js';

const router = Router();

router.all('/*', handleAuth);

export default router;
