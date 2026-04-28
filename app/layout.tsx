import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingBar } from "@/components/utility/LoadingBar";
import { ThemeProvider } from "@/components/utility/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Karta — Premium Shopping Experience",
    template: "%s | Karta",
  },
  description:
    "Karta is a premium e-commerce platform delivering an elegant and seamless shopping experience.",
  keywords: ["karta", "shopping", "premium", "e-commerce", "online store"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Karta",
    title: "Karta — Premium Shopping Experience",
    description: "Karta is a premium e-commerce platform.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Karta" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Runs before React — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('karta-theme');var p=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';if((t||p)==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LoadingBar />
          <Navbar session={session} />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}