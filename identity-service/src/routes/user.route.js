import express from 'express'
import { healthCheckController, getAllUsersController, registerUserController, loginUserController,logoutController, refreshTokenController } from '../controllers/identity.controller.js';

const router = express.Router();

router.get('/', healthCheckController)
router.get('/users',getAllUsersController)
router.post('/register',registerUserController)
router.post('/login',loginUserController)
router.post('/logout',logoutController)
router.post('/refresh-token',refreshTokenController)

export default router;