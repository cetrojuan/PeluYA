import { Router } from 'express';
import { requireAuth, requireClient, requireProfessional } from '@/middlewares/auth.js';
import * as appointmentsController from './appointments.controller.js';

export const appointmentsRouter = Router();
appointmentsRouter.use(requireAuth);

appointmentsRouter.get('/', appointmentsController.listMine);
appointmentsRouter.post('/', requireClient, appointmentsController.create);
appointmentsRouter.put('/:id', requireProfessional, appointmentsController.reschedule);
appointmentsRouter.patch('/:id/status', appointmentsController.updateStatus);
