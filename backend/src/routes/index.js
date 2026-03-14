import express from 'express';

import registerRoute from './register.js';
import authRoute from './auth.js';

const router = express.Router();

router.use('/register', registerRoute);
router.use('/auth', authRoute);

export default router;