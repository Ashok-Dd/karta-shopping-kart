"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    tag: "New Collection",
    headline: ["Crafted for", "the Discerning"],
    sub: "Curated pieces that speak louder than trends.",
    cta: "Explore Collection",
    ctaHref: "/products?category=new",
    accent: "#d4a853",
    accentLight: "#b8873a",
    stat: { value: "2,400+", label: "Premium Products" },
    // Unsplash video-style images that loop
    mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=85",
    mediaBg: "#1a1410",
    mediaBgLight: "#f5ede0",
  },
  {
    tag: "Limited Edition",
    headline: ["Where Form", "Meets Function"],
    sub: "Precision design. Uncompromising quality.",
    cta: "Shop Limited Edition",
    ctaHref: "/products?category=limited",
    accent: "#7ea8c4",
    accentLight: "#2563eb",
    stat: { value: "50+", label: "Exclusive Drops" },
    mediaUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85",
    mediaBg: "#0d1520",
    mediaBgLight: "#e8f0f8",
  },
  {
    tag: "Best Sellers",
    headline: ["The Essentials,", "Elevated"],
    sub: "Timeless staples chosen by thousands.",
    cta: "Shop Best Sellers",
    ctaHref: "/products?sort=popular",
    accent: "#a87dcc",
    accentLight: "#7c3aed",
    stat: { value: "98%", label: "Satisfaction Rate" },
    mediaUrl: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&q=85",
    mediaBg: "#130d1a",
    mediaBgLight: "#f3eeff",
  },
];

export function HeroSection() {
  const heroRef    = useRef<HTMLDivElement>(null);
  const mediaRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const textRef    = useRef<HTMLDivElement>(null);
  const [active, setActive]       = useState(0);
  const [prev,   setPrev]         = useState<number | null>(null);
  const [isLight, setIsLight]     = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect theme
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((next: number) => {
    setPrev(active);
    setActive(next);
  }, [active]);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((a) => {
        setPrev(a);
        return (a + 1) % slides.length;
      });
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    let ctx: { revert?: () => void } | null = null;
    async function init() {
      const { gsap }        = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay: 0.15 });
        tl.fromTo(".h-tag",  { opacity: 0, y: 16, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" })
          .fromTo(".h-line", { opacity: 0, y: 48, skewY: 2 },            { opacity: 1, y: 0, skewY: 0, duration: 0.65, ease: "power3.out", stagger: 0.1 }, "-=0.25")
          .fromTo(".h-sub",  { opacity: 0, y: 16 },                      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
          .fromTo(".h-ctas", { opacity: 0, y: 14 },                      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.25")
          .fromTo(".h-stat", { opacity: 0, x: -12 },                     { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", stagger: 0.08 }, "-=0.2")
          .fromTo(".h-media",{ opacity: 0, scale: 0.94, x: 30 },         { opacity: 1, scale: 1, x: 0, duration: 0.7, ease: "power3.out" }, "-=0.5");

        // Subtle parallax
        gsap.to(".h-media", {
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.2 },
          y: 50, ease: "none",
        });
      }, heroRef);
    }
    init();
    return () => ctx?.revert?.();
  }, []);

  const slide   = slides[active];
  const accent  = isLight ? slide.accentLight : slide.accent;
  const bgColor = isLight ? slide.mediaBgLight : slide.mediaBg;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      style={{
        background: isLight
          ? `linear-gradient(135deg, #fafaf9 0%, ${slide.mediaBgLight} 100%)`
          : `linear-gradient(135deg, #0a0a0a 0%, ${slide.mediaBg} 100%)`,
        transition: "background 0.8s ease",
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.035)"} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow blob */}
      <div
        className="absolute pointer-events-none transition-all duration-1000"
        style={{
          top: "10%", left: "5%",
          width: "40vw", height: "40vw",
          borderRadius: "50%",
          background: accent,
          opacity: isLight ? 0.06 : 0.04,
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100dvh-5rem)]">

          {/* ── LEFT: Text ───────────────────────────────── */}
          <div ref={textRef} className="flex flex-col justify-center py-8 lg:py-0">
            {/* Tag */}
            <div className="h-tag flex items-center gap-2.5 mb-6 opacity-0">
              <span
                className="h-px w-8 transition-colors duration-700"
                style={{ background: accent }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-700"
                style={{ color: accent }}
              >
                {slide.tag}
              </span>
            </div>

            {/* Headline */}
            <div className="overflow-hidden mb-5">
              {slide.headline.map((line, i) => (
                <div
                  key={i}
                  className="h-line opacity-0 font-display leading-[1.05] font-semibold"
                  style={{
                    fontSize: "clamp(2.6rem, 5.5vw, 4.5rem)",
                    color: "var(--color-text)",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Sub */}
            <p
              className="h-sub opacity-0 mb-8 max-w-sm"
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.65,
                color: "var(--color-text-muted)",
              }}
            >
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="h-ctas opacity-0 flex items-center gap-3 flex-wrap mb-10">
              <Link href={slide.ctaHref}>
                <Button
                  size="lg"
                  className="gap-2 group"
                  style={{ background: accent, color: isLight ? "#fff" : "#0a0a0a" } as React.CSSProperties}
                >
                  {slide.cta}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" size="lg" className="gap-1.5">
                  Browse All <ArrowUpRight size={14} />
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8">
              {[
                slide.stat,
                { value: "Free", label: "Shipping ₹999+" },
                { value: "30d",  label: "Easy Returns"  },
              ].map(({ value, label }) => (
                <div key={label} className="h-stat opacity-0">
                  <p
                    className="font-display font-semibold text-xl leading-none mb-0.5 transition-colors duration-700"
                    style={{ color: accent }}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-subtle)] uppercase tracking-wider">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div className="flex items-center gap-2 mt-10">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); goTo(i); }}
                  className="h-0.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === active ? 32 : 14,
                    background: i === active ? accent : "var(--color-border-strong)",
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT: Media carousel ─────────────────────── */}
          <div className="h-media opacity-0 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[520px]" style={{ aspectRatio: "4/5" }}>
              {/* Main image card */}
              <div
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700"
                style={{ background: bgColor }}
              >
                {slides.map((s, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      opacity: i === active ? 1 : 0,
                      transform: i === active
                        ? "scale(1) translateY(0)"
                        : i === prev
                        ? "scale(1.04) translateY(-8px)"
                        : "scale(0.97) translateY(12px)",
                      zIndex: i === active ? 2 : 1,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.mediaUrl}
                      alt={s.tag}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isLight
                          ? "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 60%)"
                          : "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 65%)",
                      }}
                    />
                  </div>
                ))}

                {/* Bottom label on image */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
                  <div
                    className="rounded-2xl p-4 backdrop-blur-md transition-colors duration-700"
                    style={{
                      background: isLight
                        ? "rgba(255,255,255,0.75)"
                        : "rgba(0,0,0,0.5)",
                      border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1 transition-colors duration-500"
                      style={{ color: accent }}
                    >
                      {slide.tag}
                    </p>
                    <p
                      className="font-display text-sm font-medium"
                      style={{ color: isLight ? "#1a1612" : "#f5f5f5" }}
                    >
                      {slide.headline.join(" ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badge — top right */}
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-xl backdrop-blur-sm transition-all duration-700"
                style={{
                  background: isLight ? "rgba(255,255,255,0.9)" : "rgba(20,20,20,0.9)",
                  border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <p
                  className="font-display text-xl font-bold leading-none transition-colors duration-500"
                  style={{ color: accent }}
                >
                  {slide.stat.value}
                </p>
                <p
                  className="text-[9px] uppercase tracking-wider mt-0.5 text-center leading-tight px-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {slide.stat.label}
                </p>
              </div>

              {/* Thumbnail strip — left side */}
              <div className="absolute -left-14 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2.5">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); goTo(i); }}
                    className="relative w-10 h-10 rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                      opacity: i === active ? 1 : 0.45,
                      transform: i === active ? "scale(1.1)" : "scale(1)",
                      boxShadow: i === active ? `0 0 0 2px ${accent}` : "none",
                    }}
                    aria-label={`View ${s.tag}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.mediaUrl}
                      alt={s.tag}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div
                className="absolute bottom-[-16px] left-0 right-0 h-0.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background: accent,
                    width: `${((active + 1) / slides.length) * 100}%`,
                    transition: "width 5s linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <div
          className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
          style={{ borderColor: "var(--color-border-strong)" }}
        >
          <div
            className="w-0.5 h-2 rounded-full"
            style={{
              background: "var(--color-text-subtle)",
              animation: "scrollCue 1.8s ease-in-out infinite",
            }}
          />
        </div>
        <style>{`@keyframes scrollCue{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(5px)}}`}</style>
      </div>
    </section>
  );
}