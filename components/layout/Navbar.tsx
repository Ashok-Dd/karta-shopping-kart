"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Search, User, Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
// import { useTheme } from "";
import type { Session } from "next-auth";
import { useTheme } from "../utility/ThemeProvider";

interface NavbarProps {
  session: Session | null;
}

const navLinks = [
  { href: "/products",              label: "Shop"   },
  { href: "/products?category=new", label: "New In" },
  { href: "/products?category=sale",label: "Sale"   },
];

export function Navbar({ session }: NavbarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, toggle } = useTheme();

  const [isScrolled,   setIsScrolled]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [cartCount,    setCartCount]    = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Fetch cart count when session exists
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCartCount(d.data?.length ?? 0))
      .catch(() => {});
  }, [session, pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-lg"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl tracking-tight font-semibold text-gradient shrink-0">
            KARTA
          </Link>

          {/* Desktop Nav */}
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

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search bar (expands inline) */}
            <div className="flex items-center">
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
            </div>

            {/* Theme toggle */}
            {!searchOpen && (
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* User dropdown */}
            {!searchOpen && (
              session ? (
                <div className="relative group">
                  <button className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors flex items-center gap-1">
                    <User size={18} />
                    <ChevronDown size={12} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
                    <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
                      <p className="text-xs font-medium text-[var(--color-text)] truncate">{session.user?.name || session.user?.email}</p>
                    </div>
                    <Link href="/orders" className="block px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors">My Orders</Link>
                    <Link href="/profile" className="block px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors">Profile</Link>
                    {(session.user as { role?: string })?.role === "ADMIN" && (
                      <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-[var(--color-accent-2)] hover:bg-[var(--color-surface-2)] transition-colors">Admin Panel</Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-surface-2)] transition-colors border-t border-[var(--color-border)]"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors" aria-label="Sign in">
                  <User size={18} />
                </Link>
              )
            )}

            {/* Cart */}
            {!searchOpen && (
              <Link href="/cart" className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors" aria-label="Cart">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--color-accent-2)] text-[#0a0a0a] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile toggle */}
            {!searchOpen && (
              <button className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors" onClick={() => setIsMobileOpen((v) => !v)} aria-label="Menu">
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-[var(--color-bg)]/98 backdrop-blur-md border-b border-[var(--color-border)] animate-slide-down">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-6 pt-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full h-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent-2)] outline-none"
              />
            </div>
          </form>
          <nav className="flex flex-col py-3 px-6 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "py-3 px-4 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-[var(--color-accent-2)] bg-[var(--color-surface)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <Link href="/login" className="mt-2 py-3 px-4 rounded-lg text-sm font-medium bg-[var(--color-surface)] text-center text-[var(--color-text)]">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}