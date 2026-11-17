import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.js';
import { loginLimiter } from '@/middlewares/security.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', loginLimiter, authController.register);
authRouter.post('/login', loginLimiter, authController.login);
authRouter.get('/me', requireAuth, authController.me);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.put('/password', requireAuth, loginLimiter, authController.changePassword);
authRouter.post('/revoke-sessions', requireAuth, authController.revokeSessions);
