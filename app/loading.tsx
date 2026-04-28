import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-shimmer h-10 w-48 rounded-xl mb-2" />
        <div className="animate-shimmer h-4 w-24 rounded mb-10" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
