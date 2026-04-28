import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="font-display text-8xl font-semibold text-gradient mb-4">404</p>
        <h1 className="font-display text-3xl mb-3">Page Not Found</h1>
        <p className="text-(--color-text-muted) mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"><Button size="lg">Go Home</Button></Link>
          <Link href="/products"><Button variant="secondary" size="lg">Browse Products</Button></Link>
        </div>
      </div>
    </div>
  );
}
