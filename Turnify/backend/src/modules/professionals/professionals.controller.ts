import type { Request, Response } from 'express';
import { businessSchema } from './professionals.schemas.js';
import * as professionalsService from './professionals.service.js';

export async function list(_req: Request, res: Response) {
  res.json(await professionalsService.listPublic());
}

export async function updateMyBusiness(req: Request, res: Response) {
  res.json(await professionalsService.updateBusiness(req.user!.id, businessSchema.parse(req.body)));
}
