import { z } from 'zod';
import { text } from '@/lib/validation.js';

export const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mercado Pago'] as const;

/** Datos del negocio y de cobro del profesional. */
export const businessSchema = z
  .object({
    businessName: text().min(2),
    category: text(60).min(2),
    description: text(2000),
    address: text(250),
    paymentMethods: z.array(z.enum(PAYMENT_METHODS)).min(1).max(4),
    paymentAlias: text(100),
    paymentCBU: z.string().regex(/^(\d{22})?$/, 'CBU/CVU: 22 dígitos'),
    paymentHolder: text(),
    paymentInstructions: text(1000),
  })
  .strict()
  .refine(
    (b) => !b.paymentMethods.includes('Transferencia') || !!((b.paymentAlias || b.paymentCBU) && b.paymentHolder),
    'Para transferencia indicá titular y alias o CBU/CVU',
  );
export type BusinessInput = z.infer<typeof businessSchema>;
