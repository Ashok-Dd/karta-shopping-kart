import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-muted)]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-text-subtle)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 bg-[var(--color-surface)] border rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] transition-all duration-200 outline-none",
              "focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
              error
                ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]",
              leftIcon ? "pl-10 pr-4" : "px-4",
              rightIcon ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-text-subtle)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-error)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-subtle)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
