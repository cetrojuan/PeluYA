import { z } from 'zod';

// Se valida antes de consultar: arrays, decimales y tamaños excesivos son errores 400.
const positiveInteger = (fallback: string, max: number) => z.string().regex(/^[1-9]\d*$/)
  .default(fallback).transform(Number).pipe(z.number().int().min(1).max(max));

export const paginationShape = {
  page: positiveInteger('1', 1_000_000),
  pageSize: positiveInteger('10', 50),
};

export interface PageQuery { page: number; pageSize: number }

export function pageResult<T>(items: T[], total: number, query: PageQuery) {
  return { items, total, page: query.page, pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
}
