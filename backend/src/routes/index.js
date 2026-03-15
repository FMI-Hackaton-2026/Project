import express from 'express';

import registerRoute from './register.js';
import authRoute from './auth.js';
import surgeRoute from './surge.js';
import statsRoute from './stats.js';

const router = express.Router();

router.use('/register', registerRoute);
router.use('/auth', authRoute);
router.use('/surge', surgeRoute);
router.use('/stats', statsRoute);

export default router;