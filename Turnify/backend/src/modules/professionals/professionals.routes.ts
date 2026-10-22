import { Router } from 'express';
import { requireAuth, requireProfessional } from '@/middlewares/auth.js';
import * as professionalsController from './professionals.controller.js';

/** /api/professionals: listado público */
export const professionalsRouter = Router();
professionalsRouter.get('/', professionalsController.list);

/** /api/professional: el negocio del profesional logueado */
export const myBusinessRouter = Router();
myBusinessRouter.put('/', requireAuth, requireProfessional, professionalsController.updateMyBusiness);
