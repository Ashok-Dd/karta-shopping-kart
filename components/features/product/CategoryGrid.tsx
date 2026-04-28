import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Shield, RefreshCw, Truck , Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
 } from "lucide-react";

const categories = [
  {
    label: "Electronics",
    slug: "electronics",
    icon: Laptop,
    description: "Gadgets & tech",
  },
  {
    label: "Fashion",
    slug: "fashion",
    icon: Shirt,
    description: "Style & apparel",
  },
  {
    label: "Home & Living",
    slug: "home",
    icon: Home,
    description: "Interior essentials",
  },
  {
    label: "Beauty",
    slug: "beauty",
    icon: Sparkles,
    description: "Skincare & cosmetics",
  },
  {
    label: "Sports",
    slug: "sports",
    icon: Dumbbell,
    description: "Active lifestyle",
  },
  {
    label: "Books",
    slug: "books",
    icon: BookOpen,
    description: "Knowledge & stories",
  },
];
export function CategoryGrid() {
  return (
    <section className="bg-[var(--color-surface)] border-y border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-subtle)] mb-3">
            Discover
          </p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 text-center overflow-hidden"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-[radial-gradient(circle_at_center,var(--color-accent)/10,transparent_70%)]" />

                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-surface-2)] group-hover:bg-[var(--color-accent)/10] transition">
                  <Icon className="w-6 h-6 text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition" />
                </div>

                {/* Text */}
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                    {cat.label}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-subtle)] mt-1">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const perks = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
  { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free returns" },
  { icon: Zap, title: "Fast Delivery", desc: "2-5 business days" },
];

export function PromoSection() {
  return (
    <>
      {/* Perks bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-dim)] flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[var(--color-accent-2)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1410] to-[#0f0d0a] border border-[var(--color-border)] p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, var(--color-accent-2) 0%, transparent 70%)",
            }}
          />
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent-2)] mb-4">
            Limited Time
          </p>
          <h2 className="font-display text-3xl sm:text-5xl mb-4">
            Up to 40% Off<br />
            <span className="text-gradient">Sale Collection</span>
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
            Premium products at unbeatable prices. Shop the sale before it ends.
          </p>
          <Link href="/products?category=sale">
            <Button size="lg" className="group">
              Shop the Sale
              <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
