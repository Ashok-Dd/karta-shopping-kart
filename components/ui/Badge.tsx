import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "accent";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border-strong)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20",
  error: "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20",
  info: "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20",
  accent: "bg-[var(--color-accent-dim)] text-[var(--color-accent-2)] border border-[var(--color-accent-2)]/20",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import type { OrderStatus } from "@/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    PAID: { variant: "info", label: "Paid" },
    SHIPPED: { variant: "accent", label: "Shipped" },
    DELIVERED: { variant: "success", label: "Delivered" },
    CANCELLED: { variant: "error", label: "Cancelled" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
