import express from 'express';
import { getStats, setLastGambling } from '../controllers/stats.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, getStats);
router.patch('/last-gambling', requireAuth, setLastGambling);

export default router;
