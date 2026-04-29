"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Search, User, Menu, X,
  ChevronDown, Sun, Moon, Package, LogOut,
  LayoutDashboard, ClipboardList, Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "../utility/ThemeProvider";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

const navLinks = [
  { href: "/products",               label: "Shop"   },
  { href: "/products?category=new",  label: "New In" },
  { href: "/products?category=sale", label: "Sale"   },
];

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme, toggle } = useTheme();

  const [isScrolled,   setIsScrolled]   = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [cartCount,    setCartCount]    = useState(0);
  const searchRef  = useRef<HTMLInputElement>(null);
  const mSearchRef = useRef<HTMLInputElement>(null);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  // Scroll detection
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Auto-focus desktop search
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Auto-focus mobile search when drawer opens
  useEffect(() => {
    if (mobileOpen) setTimeout(() => mSearchRef.current?.focus(), 80);
  }, [mobileOpen]);

  // Cart count
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCartCount(d.data?.length ?? 0))
      .catch(() => {});
  }, [session, pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setMobileOpen(false);
    setSearchQuery("");
  }

  async function handleSignOut() {
    setMobileOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl tracking-tight font-semibold text-gradient shrink-0"
            >
              KARTA
            </Link>

            {/* ── DESKTOP NAV ────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors",
                    pathname === link.href
                      ? "text-[var(--color-accent-2)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── DESKTOP ACTIONS ────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1 animate-fade-in">
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="h-9 w-44 sm:w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent-2)] outline-none transition-all"
                  />
                  <button type="submit" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                    <Search size={16} />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User dropdown */}
              {session ? (
                <div className="relative group">
                  <button className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors flex items-center gap-1">
                    <User size={18} />
                    <ChevronDown size={12} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
                    <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                      <p className="text-xs font-medium text-[var(--color-text)] truncate">
                        {session.user?.name || session.user?.email}
                      </p>
                    </div>
                    <Link href="/orders"  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <ClipboardList size={14} /> My Orders
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <User size={14} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-accent-2)] hover:bg-[var(--color-surface-2)] transition-colors">
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-surface-2)] transition-colors border-t border-[var(--color-border)]"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                  aria-label="Sign in"
                >
                  <User size={18} />
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--color-accent-2)] text-[#0a0a0a] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* ── MOBILE: only Search + Menu ─────────────── */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => { setMobileOpen(true); setSearchOpen(true); }}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => { setMobileOpen(true); setSearchOpen(false); }}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN DRAWER ──────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs flex flex-col md:hidden animate-slide-down"
            style={{ background: "var(--color-bg)", borderLeft: "1px solid var(--color-border)" }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 h-16 shrink-0"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <span className="font-display text-xl font-semibold text-gradient">KARTA</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-subtle)" }}
                  />
                  <input
                    ref={mSearchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full h-11 rounded-xl pl-9 pr-4 text-sm outline-none transition-all"
                    style={{
                      background:  "var(--color-surface)",
                      border:      "1px solid var(--color-border)",
                      color:       "var(--color-text)",
                    }}
                  />
                </div>
              </form>

              {/* Section label */}
              <p className="text-[10px] uppercase tracking-widest px-3 mb-1" style={{ color: "var(--color-text-subtle)" }}>
                Shop
              </p>

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color:      pathname === link.href ? "var(--color-accent-2)"  : "var(--color-text-muted)",
                    background: pathname === link.href ? "var(--color-accent-dim)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="my-3 h-px" style={{ background: "var(--color-border)" }} />

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium w-full text-left transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                {theme === "dark"
                  ? <><Sun size={16} /> Light Mode</>
                  : <><Moon size={16} /> Dark Mode</>}
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                <div className="relative">
                  <ShoppingCart size={16} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-[9px] font-bold rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-accent-2)", color: "#0a0a0a" }}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>

              {/* Account section */}
              {session ? (
                <>
                  <div className="my-3 h-px" style={{ background: "var(--color-border)" }} />

                  <p className="text-[10px] uppercase tracking-widest px-3 mb-1" style={{ color: "var(--color-text-subtle)" }}>
                    Account
                  </p>

                  {/* User info */}
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-accent-dim)" }}
                    >
                      <User size={14} style={{ color: "var(--color-accent-2)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                        {session.user?.name || "Account"}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "var(--color-text-subtle)" }}>
                        {session.user?.email}
                      </p>
                    </div>
                  </div>

                  <Link href="/orders"  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors" style={{ color: "var(--color-text-muted)" }}>
                    <ClipboardList size={16} /> My Orders
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors" style={{ color: "var(--color-text-muted)" }}>
                    <Settings size={16} /> Profile
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="my-2 h-px" style={{ background: "var(--color-border)" }} />
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                        style={{ color: "var(--color-accent-2)", background: "var(--color-accent-dim)" }}
                      >
                        <LayoutDashboard size={16} /> Admin Panel
                      </Link>
                    </>
                  )}

                  <div className="my-2 h-px" style={{ background: "var(--color-border)" }} />

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium w-full text-left transition-colors"
                    style={{ color: "var(--color-error)" }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="my-3 h-px" style={{ background: "var(--color-border)" }} />
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 mx-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: "var(--color-accent-2)", color: "#0a0a0a" }}
                  >
                    <User size={15} /> Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 mx-3 py-3 rounded-xl text-sm font-medium mt-2 transition-colors"
                    style={{
                      background: "var(--color-surface)",
                      border:     "1px solid var(--color-border)",
                      color:      "var(--color-text-muted)",
                    }}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {/* Drawer footer */}
            <div
              className="px-5 py-4 text-center shrink-0"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <p className="text-[10px]" style={{ color: "var(--color-text-subtle)" }}>
                © {new Date().getFullYear()} Karta. All rights reserved.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}