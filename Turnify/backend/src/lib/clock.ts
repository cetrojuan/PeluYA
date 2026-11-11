import { env } from '@/config/env.js';

// Hora actual en la zona horaria del negocio (APP_TIMEZONE del .env).

/** Fecha y hora actuales en la zona horaria del negocio (APP_TIMEZONE). */
export function nowInAppTz() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.APP_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

/** ¿El momento "AAAA-MM-DD" + "HH:mm" (hora del negocio) ya llegó? */
export function hasArrived(yyyyMmDd: string, hhmm: string) {
  const now = nowInAppTz();
  return `${yyyyMmDd}T${hhmm}` <= `${now.date}T${now.time}`;
}
