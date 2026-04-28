import Link from "next/link";
import { Globe, XIcon, GitBranch } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?category=new" },
    { label: "Sale", href: "/products?category=sale" },
    { label: "Categories", href: "/products" },
  ],
  Help: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Contact", href: "/contact" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="font-display text-3xl font-semibold text-gradient w-fit">
              KARTA
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              Premium shopping, reimagined. Curated collections for discerning tastes — delivered with elegance.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: Globe, href: "#", label: "Instagram" },
                { icon: XIcon, href: "#", label: "Twitter" },
                { icon: GitBranch, href: "#", label: "GitHub" },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors"
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-subtle)]">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-subtle)]">
            © {new Date().getFullYear()} Karta. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
