import express from 'express';
import { submitSurge } from '../controllers/surge.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.post('/', requireAuth, submitSurge);

export default router;
