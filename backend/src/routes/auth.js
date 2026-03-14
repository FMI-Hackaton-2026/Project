import express from 'express';
import { login, me, refresh } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', requireAuth ,me);
router.post('/refresh', refresh)

export default router; 