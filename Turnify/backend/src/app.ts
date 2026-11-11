import express, { Router } from 'express';
import { applySecurity } from '@/middlewares/security.js';
import { errorHandler, notFoundHandler } from '@/middlewares/error.js';
import { authRouter } from '@/modules/auth/auth.routes.js';
import { profileRouter } from '@/modules/profile/profile.routes.js';
import { myBusinessRouter, professionalsRouter } from '@/modules/professionals/professionals.routes.js';
import { servicesRouter } from '@/modules/services/services.routes.js';
import { availabilityRouter } from '@/modules/availability/availability.routes.js';
import { appointmentsRouter } from '@/modules/appointments/appointments.routes.js';

/** Versión de la API. Un cambio que rompa a apps ya instaladas va en una v2. */
export const API_VERSION = '1.0.0';

export const app = express();
applySecurity(app);

const v1 = Router();
v1.get('/health', (_req, res) => res.json({ ok: true, version: API_VERSION }));
v1.use('/auth', authRouter);
v1.use('/profile', profileRouter);
v1.use('/professionals', professionalsRouter);
v1.use('/professional', myBusinessRouter);
v1.use('/services', servicesRouter);
v1.use('/availability', availabilityRouter);
v1.use('/appointments', appointmentsRouter);

app.use('/api/v1', v1);
// Alias sin versión para el front actual. Cuando el front use /api/v1, se puede quitar.
app.use('/api', v1);

app.use(notFoundHandler);
app.use(errorHandler);
