"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, Settings, ChevronRight, ArrowLeft,
  Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/products", icon: Package,         label: "Products"  },
  { href: "/dashboard/orders",   icon: ShoppingBag,     label: "Orders"    },
  { href: "/dashboard/users",    icon: Users,           label: "Users"     },
  { href: "/dashboard/settings", icon: Settings,        label: "Settings"  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3.5 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <p
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--color-text-subtle)" }}
        >
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2.5 flex-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
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
                  e.currentTarget.style.color      = "var(--color-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color      = "var(--color-text-muted)";
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
      <div
        className="p-2.5 shrink-0"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ color: "var(--color-text-subtle)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-surface-2)";
            e.currentTarget.style.color      = "var(--color-text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color      = "var(--color-text-subtle)";
          }}
        >
          <ArrowLeft size={13} /> Back to Store
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP: sticky sidebar ──────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 self-start"
        style={{
          borderRight: "1px solid var(--color-border)",
          background:  "var(--color-surface)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE: floating toggle button ───────────────── */}
      {/*
        Sits at bottom-left so it never overlaps the navbar's top-right menu.
        z-[60] puts it above page content but the drawer itself is z-[60].
      */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 left-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-semibold transition-all"
        style={{
          background: "var(--color-accent-2)",
          color:      "#0a0a0a",
          boxShadow:  "0 4px 20px rgba(0,0,0,0.35)",
        }}
        aria-label="Open admin menu"
      >
        <Menu size={16} />
        Admin
      </button>

      {/* ── MOBILE: drawer ───────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop — closes drawer, does NOT close navbar */}
          <div
            className="lg:hidden fixed inset-0 z-[61] bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel slides in from LEFT (opposite side to navbar's right drawer) */}
          <div
            className="lg:hidden fixed top-0 left-0 bottom-0 z-[62] w-64 flex flex-col animate-slide-in-left"
            style={{
              background:  "var(--color-surface)",
              borderRight: "1px solid var(--color-border)",
              boxShadow:   "4px 0 24px rgba(0,0,0,0.3)",
            }}
          >
            {/* Drawer top bar */}
            <div
              className="flex items-center justify-between px-4 h-14 shrink-0"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Admin Panel
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="Close admin menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Reuse the same nav content */}
            <div className="flex-1 overflow-hidden">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* Slide-in-left keyframe (not in globals.css yet) */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.25s cubic-bezier(0.32,0.72,0,1) forwards;
        }
      `}</style>
    </>
  );
}