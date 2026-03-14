import express from 'express';

import registerRoute from './register.js'

const router = express.Router();

router.use('/register', registerRoute);

export default router;