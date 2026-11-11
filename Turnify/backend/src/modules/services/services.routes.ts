import { Router } from 'express';
import { requireAuth, requireProfessional } from '@/middlewares/auth.js';
import * as servicesController from './services.controller.js';

export const servicesRouter = Router();
servicesRouter.use(requireAuth, requireProfessional);

servicesRouter.post('/', servicesController.create);
servicesRouter.put('/:id', servicesController.update);
servicesRouter.delete('/:id', servicesController.remove);
