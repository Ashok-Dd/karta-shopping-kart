"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <Toaster />");
  return ctx;
}

/**
 * Global singleton — can be called from any non-component code:
 *   import { toast } from "@/components/ui/Toaster";
 *   toast.success("Done!");
 */
let _dispatch: ((t: Omit<ToastItem, "id">) => void) | null = null;

export const toast = {
  success: (title: string, description?: string) =>
    _dispatch?.({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    _dispatch?.({ type: "error", title, description }),
  info: (title: string, description?: string) =>
    _dispatch?.({ type: "info", title, description }),
  warning: (title: string, description?: string) =>
    _dispatch?.({ type: "warning", title, description }),
};

/* ─── Icons ─────────────────────────────────────────────── */
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle   size={16} className="text-[var(--color-success)] shrink-0" />,
  error:   <AlertCircle   size={16} className="text-[var(--color-error)]   shrink-0" />,
  info:    <Info          size={16} className="text-[var(--color-info)]    shrink-0" />,
  warning: <AlertTriangle size={16} className="text-[var(--color-warning)] shrink-0" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-[var(--color-success)]",
  error:   "border-l-[var(--color-error)]",
  info:    "border-l-[var(--color-info)]",
  warning: "border-l-[var(--color-warning)]",
};

/* ─── Single toast item ──────────────────────────────────── */
function ToastCard({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), 4000);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <div
      className={cn(
        "surface rounded-xl p-4 flex items-start gap-3 border-l-4 shadow-xl",
        "min-w-[280px] max-w-[380px] animate-fade-in",
        borderColors[item.type]
      )}
    >
      {icons[item.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">{item.title}</p>
        {item.description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {item.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ─── Toaster — mount once in layout ────────────────────── */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  // Wire the global singleton to this component's add function
  const addRef = useRef(add);
  addRef.current = add;
  useEffect(() => {
    _dispatch = (t) => addRef.current(t);
    return () => { _dispatch = null; };
  }, []);

  const ctx: ToastContextValue = {
    success: (title, desc) => add({ type: "success", title, description: desc }),
    error:   (title, desc) => add({ type: "error",   title, description: desc }),
    info:    (title, desc) => add({ type: "info",    title, description: desc }),
    warning: (title, desc) => add({ type: "warning", title, description: desc }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}