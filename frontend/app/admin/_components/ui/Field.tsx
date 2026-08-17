import React from 'react';

const darkInput =
  'w-full rounded-lg border border-sand bg-sand-light px-3 py-2 text-sm text-jungle-dark placeholder-jungle/40 outline-none transition-colors duration-150 focus:border-sage';
const lightInput =
  'w-full rounded-lg border border-admin-jungle/15 bg-white px-3 py-2.5 text-sm text-admin-jungle placeholder-admin-jungle/40 outline-none transition-colors duration-150 focus:border-admin-clay';

export const inputClass = (theme: 'dark' | 'light' = 'dark', invalid = false) =>
  `${theme === 'dark' ? darkInput : lightInput} ${invalid ? '!border-rose-500' : ''}`;

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  theme?: 'dark' | 'light';
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function Field({ label, error, hint, theme = 'dark', className = '', children, htmlFor }: FieldProps) {
  const dark = theme === 'dark';
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${
          dark ? 'text-jungle/60' : 'text-admin-jungle/55'
        }`}>

        {label}
      </label>
      {children}
      {hint && !error && <p className={`mt-1 text-xs ${dark ? 'text-jungle/45' : 'text-admin-jungle/50'}`}>{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
