import type { FormEvent } from 'react';

/** Lee los campos de un <form> como objeto. Exclusivo de web (en móvil los inputs son controlados). */
export function readForm<T = Record<string, string>>(event: FormEvent<HTMLFormElement>): T {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.currentTarget)) as T;
}

/** Valores de checkboxes con el mismo name. */
export const readAll = (event: FormEvent<HTMLFormElement>, name: string) =>
  new FormData(event.currentTarget).getAll(name).map(String);
