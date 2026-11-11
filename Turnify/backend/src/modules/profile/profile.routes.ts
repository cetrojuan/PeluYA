import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.js';
import * as profileController from './profile.controller.js';

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get('/', profileController.getMine);
profileRouter.put('/', profileController.updateMine);
