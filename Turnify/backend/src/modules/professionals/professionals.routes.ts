import { Router } from 'express';
import { requireAuth, requireProfessional } from '@/middlewares/auth.js';
import * as professionalsController from './professionals.controller.js';
import * as appointmentsController from '@/modules/appointments/appointments.controller.js';

/** /api/professionals: listado público */
export const professionalsRouter = Router();
professionalsRouter.get('/', professionalsController.list);
// Slots va antes que /:id para que Express no lo confunda con un id
professionalsRouter.get('/:id/slots', appointmentsController.getSlots);

/** /api/professional: el negocio del profesional logueado */
export const myBusinessRouter = Router();
myBusinessRouter.put('/', requireAuth, requireProfessional, professionalsController.updateMyBusiness);