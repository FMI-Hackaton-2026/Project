import express from 'express';
import { createUser} from "../controllers/register.controller.js";

const router = express.Router();

router.post('/', createUser);

export default router;