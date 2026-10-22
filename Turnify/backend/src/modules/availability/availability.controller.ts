import type { Request, Response } from 'express';
import { idParam } from '@/lib/validation.js';
import { availabilitySchema } from './availability.schemas.js';
import * as availabilityService from './availability.service.js';

export async function create(req: Request, res: Response) {
  await availabilityService.create(req.user!.id, availabilitySchema.parse(req.body));
  res.status(201).json({ ok: true });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await availabilityService.remove(req.user!.id, id);
  res.json({ ok: true });
}
