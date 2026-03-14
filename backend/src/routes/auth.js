import express from 'express';
import { login, logout, me, refresh } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', requireAuth ,me);
router.post('/refresh', refresh)
router.post('/logout', logout);

export default router; 