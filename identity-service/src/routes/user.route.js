import express from 'express'
import { healthCheckController, getAllUsersController, registerUserController } from '../controllers/identity.controller.js';

const router = express.Router();

router.get('/', healthCheckController)
router.get('/users',getAllUsersController)
router.post('/register',registerUserController)

export default router;