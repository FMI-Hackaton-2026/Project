import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { updateDecision } from '../controllers/user.controller.js';

const router = express.Router();

router.put('/decision', requireAuth ,updateDecision);

export default router; 