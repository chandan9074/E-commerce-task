"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { TbAlertCircle } from "react-icons/tb";

import { cn } from "@/lib/utils/cn";

/**
 * Form primitives.
 *
 * `Field` owns label/description/error wiring (`id`, `aria-describedby`,
 * `aria-invalid`) so every input in checkout is accessible by construction
 * rather than by remembering.
 */

const controlClasses = (invalid?: boolean) =>
  cn(
    "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground transition-colors",
    "placeholder:text-muted/60 disabled:cursor-not-allowed disabled:opacity-60",
    invalid
      ? "border-danger-500 focus:border-danger-500"
      : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-brand-500",
  );

export interface FieldProps {
  label: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function Field({ label, children, error, hint, required, className }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-500" aria-hidden>
            *
          </span>
        )}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs font-medium text-danger-600" role="alert">
          <TbAlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClasses(invalid), className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses(invalid), "min-h-24 resize-y", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses(invalid), "appearance-none bg-no-repeat pr-9", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "1rem",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }>(
  function Checkbox({ className, label, ...props }, ref) {
    return (
      <label className={cn("flex cursor-pointer items-start gap-2.5 text-sm text-foreground", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-[var(--border-strong)] accent-brand-600"
          {...props}
        />
        <span className="leading-snug">{label}</span>
      </label>
    );
  },
);
