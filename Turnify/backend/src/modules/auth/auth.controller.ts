import type { Request, Response } from 'express';
import { changePasswordSchema, loginSchema, registerSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';
import { clearSessionCookie, startSession } from './session.service.js';

export async function register(req: Request, res: Response) {
  const user = await authService.register(registerSchema.parse(req.body));
  res.json({ user, csrf: await startSession(req, res, user.id) });
}

export async function login(req: Request, res: Response) {
  const user = await authService.login(loginSchema.parse(req.body));
  res.json({ user, csrf: await startSession(req, res, user.id) });
}

export async function me(req: Request, res: Response) {
  res.json(await authService.getSessionUser(req.user!.id, req.sessionId!));
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.sessionId!);
  clearSessionCookie(res);
  res.json({ ok: true });
}

export async function changePassword(req: Request, res: Response) {
  await authService.changePassword(req.user!, changePasswordSchema.parse(req.body));
  clearSessionCookie(res);
  res.json({ ok: true });
}

export async function revokeSessions(req: Request, res: Response) {
  await authService.revokeOtherSessions(req.user!.id, req.sessionId!);
  res.json({ ok: true });
}
