import type { Appointment, AppointmentStatus } from '../models/types';

const BUSINESS_TIMEZONE = 'America/Argentina/Buenos_Aires';

export const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
};

export const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mercado Pago'];

export const money = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

/** Hoy en Argentina como "AAAA-MM-DD". */
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

/** "2026-10-26..." → "26/10/2026" */
export const dateLabel = (date: string) => new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('es-AR');

export const firstName = (name: string) => name.split(' ')[0];

export const isActive = (a: Appointment) => a.status === 'PENDING' || a.status === 'CONFIRMED';
export const isClosed = (a: Appointment) => a.status === 'CANCELLED' || a.status === 'COMPLETED';
export const isUpcoming = (a: Appointment) => isActive(a) && a.date.slice(0, 10) >= today();
