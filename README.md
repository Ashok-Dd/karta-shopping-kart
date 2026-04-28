# KARTA — Premium E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15, TypeScript, PostgreSQL, Prisma, NextAuth v5, Razorpay, Tailwind CSS v4, and GSAP.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 15 (App Router)             |
| Language    | TypeScript 5                        |
| Styling     | Tailwind CSS v4                     |
| Database    | PostgreSQL + Prisma ORM             |
| Auth        | NextAuth v5 (Credentials + Google)  |
| Payments    | Razorpay                            |
| Animations  | GSAP 3                              |
| Forms       | React Hook Form + Zod               |
| Icons       | Lucide React                        |

---

## Project Structure

```
karta/
├── app/
│   ├── (auth)/login        # Login page
│   ├── (auth)/signup       # Signup page
│   ├── (shop)/products     # Product listing (SSR)
│   ├── (shop)/products/[slug]  # Product detail (SSG + JSON-LD)
│   ├── (shop)/cart         # Cart page
│   ├── (shop)/checkout     # Checkout + Razorpay
│   ├── (shop)/orders       # Order history
│   ├── (admin)/dashboard   # Admin dashboard
│   ├── (admin)/products    # Product management
│   ├── (admin)/orders      # Order management
│   ├── api/                # API routes
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt
├── components/
│   ├── ui/                 # Button, Input, Card, Modal, Badge, Skeleton, Toast
│   ├── layout/             # Navbar, Footer
│   ├── features/           # Product, Cart, Auth, Admin components
│   └── utility/            # LoadingBar, ProtectedRoute
├── lib/
│   ├── prisma.ts           # Prisma singleton
│   ├── auth.ts             # NextAuth config
│   ├── razorpay.ts         # Razorpay client + signature verify
│   └── utils.ts            # cn(), formatPrice(), slugify()
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── types/
│   └── index.ts            # TypeScript types
└── middleware.ts            # Route protection
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd karta
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/karta"
AUTH_SECRET="generate-with: openssl rand -base64 32"
GOOGLE_CLIENT_ID="from Google Cloud Console"
GOOGLE_CLIENT_SECRET="from Google Cloud Console"
RAZORPAY_KEY_ID="from Razorpay Dashboard"
RAZORPAY_KEY_SECRET="from Razorpay Dashboard"
NEXT_PUBLIC_RAZORPAY_KEY_ID="same as RAZORPAY_KEY_ID"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database setup

```bash
npm run db:push       # Push schema to DB
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed sample data
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Seed Credentials

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@karta.com   | admin123  |
| User  | user@karta.com    | user123   |

Admin portal: `/dashboard`

---

## Key Features

- **SSR/SSG** — Product pages use `generateStaticParams` for ISR
- **SEO** — Dynamic metadata, OG tags, JSON-LD, sitemap, robots.txt
- **GSAP** — Hero animations with scroll parallax
- **Razorpay** — Full payment flow with signature verification
- **Route protection** — Middleware + server-side auth checks
- **Admin portal** — Full CRUD for products, order status management
- **Dark theme** — Premium dark-first design system with CSS variables

---

## Deployment

### Vercel (recommended)

```bash
npm run build
vercel deploy
```

Set all environment variables in Vercel dashboard.

### Database

Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [PlanetScale](https://planetscale.com) for managed PostgreSQL.

---

## Important Notes

1. **next-auth v5** is still in beta — config is in `lib/auth.ts` using the new `Auth()` API
2. **Tailwind v4** uses `@theme` block in CSS instead of `tailwind.config.js`
3. **Zod v3** is used (not v4) for compatibility with `@hookform/resolvers`
4. Run `prisma generate` after any schema changes
