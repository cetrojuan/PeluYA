import type { Request, Response } from 'express';
import { updateProfileSchema } from './profile.schemas.js';
import * as profileService from './profile.service.js';

export async function getMine(req: Request, res: Response) {
  res.json(await profileService.getProfile(req.user!.id));
}

export async function updateMine(req: Request, res: Response) {
  res.json(await profileService.updateProfile(req.user!, updateProfileSchema.parse(req.body)));
}
