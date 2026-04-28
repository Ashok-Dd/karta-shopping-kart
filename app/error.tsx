"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="font-display text-2xl mb-3">Something went wrong</h2>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} size="lg">Try Again</Button>
      </div>
    </div>
  );
}
