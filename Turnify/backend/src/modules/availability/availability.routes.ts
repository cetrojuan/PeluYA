import { Router } from 'express';
import { requireAuth, requireProfessional } from '@/middlewares/auth.js';
import * as availabilityController from './availability.controller.js';

export const availabilityRouter = Router();
availabilityRouter.use(requireAuth, requireProfessional);

availabilityRouter.post('/', availabilityController.create);
availabilityRouter.delete('/:id', availabilityController.remove);
// TODO (Sebas): availabilityRouter.put('/:id', availabilityController.update);
