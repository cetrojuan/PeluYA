import type { InputHTMLAttributes } from 'react';

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> & {
  label: string;
  name: string;
  value?: string | number | null;
};

/** Campo de formulario con etiqueta. `value` es el valor inicial (formularios no controlados). */
export function Field({ label, name, type = 'text', value, required = false, maxLength = 120, ...props }: FieldProps) {
  return (
    <label>
      {label}
      <input name={name} type={type} defaultValue={value ?? ''} required={required} maxLength={maxLength} {...props} />
    </label>
  );
}
