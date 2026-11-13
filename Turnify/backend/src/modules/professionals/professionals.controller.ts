import type { Request, Response } from 'express';
import { businessSchema, listProfessionalsSchema } from './professionals.schemas.js';
import * as professionalsService from './professionals.service.js';

export async function list(req: Request, res: Response) {
  res.json(await professionalsService.listPublic(listProfessionalsSchema.parse(req.query)));
}

export async function updateMyBusiness(req: Request, res: Response) {
  res.json(await professionalsService.updateBusiness(req.user!.id, businessSchema.parse(req.body)));
}
