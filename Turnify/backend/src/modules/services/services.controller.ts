import type { Request, Response } from 'express';
import { idParam } from '@/lib/validation.js';
import { serviceSchema } from './services.schemas.js';
import * as servicesService from './services.service.js';

export async function create(req: Request, res: Response) {
  res.status(201).json(await servicesService.create(req.user!.id, serviceSchema.parse(req.body)));
}

export async function update(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await servicesService.update(req.user!.id, id, serviceSchema.parse(req.body));
  res.json({ ok: true });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await servicesService.deactivate(req.user!.id, id);
  res.json({ ok: true });
}
