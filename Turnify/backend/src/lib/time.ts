// Utilidades puras de horas y fechas (sin dependencias, fáciles de testear).
// Horas "HH:mm" ⇄ minutos desde las 00:00
export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
export const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** ¿Se pisan los rangos [aStart, aEnd) y [bStart, bEnd)? (horas "HH:mm") */
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && aEnd > bStart;

/** Día del turno "AAAA-MM-DD" como lo guarda la base (00:00 UTC). */
export const dayToDb = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00.000Z`);
