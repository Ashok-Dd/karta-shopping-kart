"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/products",  icon: Package,         label: "Products"  },
  { href: "/dashboard/orders",    icon: ShoppingBag,     label: "Orders"    },
  { href: "/dashboard/users",     icon: Users,           label: "Users"     },
  { href: "/dashboard/settings",  icon: Settings,        label: "Settings"  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 self-start"
      style={{
        borderRight: "1px solid var(--color-border)",
        background:  "var(--color-surface)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--color-text-subtle)" }}
        >
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2.5 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              )}
              style={{
                background: active ? "var(--color-accent-dim)" : "transparent",
                color:      active ? "var(--color-accent-2)"   : "var(--color-text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                  e.currentTarget.style.color       = "var(--color-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color       = "var(--color-text-muted)";
                }
              }}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ color: "var(--color-text-subtle)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-surface-2)";
            e.currentTarget.style.color       = "var(--color-text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color       = "var(--color-text-subtle)";
          }}
        >
          <ArrowLeft size={13} /> Back to Store
        </Link>
      </div>
    </aside>
  );
}