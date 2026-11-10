import type { InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

const inputClass = "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-white";

export function FormInput({ label, registration, error, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}) {
  const errorId = `${registration.name}-error`;
  return <div>
    <label htmlFor={registration.name} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    <input id={registration.name} {...registration} {...props} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`${inputClass} ${props.className ?? ""}`} />
    {error?.message && <p id={errorId} className="mt-1 text-xs text-rose-700">{error.message}</p>}
  </div>;
}

export { inputClass };
