import type { Request, Response } from 'express';
import { idParam } from '@/lib/validation.js';
import { createAppointmentSchema, rescheduleSchema, updateStatusSchema } from './appointments.schemas.js';
import * as appointmentsService from './appointments.service.js';

export async function listMine(req: Request, res: Response) {
  res.json(await appointmentsService.listMine(req.user!));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await appointmentsService.create(req.user!.id, createAppointmentSchema.parse(req.body)));
}

export async function reschedule(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  res.json(await appointmentsService.reschedule(req.user!.id, id, rescheduleSchema.parse(req.body)));
}

export async function updateStatus(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);
  await appointmentsService.updateStatus(req.user!, id, status);
  res.json({ ok: true });
}
