import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle";
  lines?: number;
}

export function Skeleton({ variant = "rect", lines = 1, className, ...props }: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-shimmer rounded",
              i === lines - 1 ? "w-2/3" : "w-full",
              "h-4"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={cn("animate-shimmer rounded-full", className)}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn("animate-shimmer rounded-xl", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-2xl" />
      <div className="flex flex-col gap-2 p-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="surface rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <Skeleton className="h-16 w-16 rounded-xl" />
      </div>
    </div>
  );
}
