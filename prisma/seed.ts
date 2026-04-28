import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description: "Studio-quality sound with active noise cancellation. 40-hour battery life. Premium leather cushions for all-day comfort.",
    price: 8999,
    comparePrice: 14999,
    images: ["https://picsum.photos/seed/headphones/800/800"],
    category: "Electronics",
    tags: ["audio", "wireless", "premium"],
    stock: 45,
    isFeatured: true,
    isPublished: true,
    rating: 4.7,
    reviewCount: 128,
  },
  {
    name: "Minimalist Leather Watch",
    slug: "minimalist-leather-watch",
    description: "Swiss movement. Genuine Italian leather strap. Sapphire crystal glass. Water resistant to 50m.",
    price: 12999,
    comparePrice: 18999,
    images: ["https://picsum.photos/seed/watch/800/800"],
    category: "Fashion",
    tags: ["watch", "leather", "minimalist"],
    stock: 22,
    isFeatured: true,
    isPublished: true,
    rating: 4.9,
    reviewCount: 87,
  },
  {
    name: "Mechanical Keyboard TKL",
    slug: "mechanical-keyboard-tkl",
    description: "Tenkeyless layout. Cherry MX Brown switches. RGB backlit. Aircraft-grade aluminum frame.",
    price: 6499,
    comparePrice: 9999,
    images: ["https://picsum.photos/seed/keyboard/800/800"],
    category: "Electronics",
    tags: ["keyboard", "mechanical", "rgb"],
    stock: 60,
    isFeatured: true,
    isPublished: true,
    rating: 4.6,
    reviewCount: 203,
  },
  {
    name: "Ceramic Pour-Over Coffee Set",
    slug: "ceramic-pour-over-coffee-set",
    description: "Hand-thrown ceramic dripper with walnut stand. Includes 50 paper filters. Makes 1-4 cups.",
    price: 2499,
    comparePrice: 3999,
    images: ["https://picsum.photos/seed/coffee/800/800"],
    category: "Home",
    tags: ["coffee", "ceramic", "kitchen"],
    stock: 35,
    isFeatured: false,
    isPublished: true,
    rating: 4.8,
    reviewCount: 54,
  },
  {
    name: "Linen Oversized Blazer",
    slug: "linen-oversized-blazer",
    description: "100% European linen. Relaxed silhouette. Fully lined. Dry clean only. Available in 4 colours.",
    price: 4999,
    comparePrice: 7999,
    images: ["https://picsum.photos/seed/blazer/800/800"],
    category: "Fashion",
    tags: ["blazer", "linen", "premium"],
    stock: 18,
    isFeatured: true,
    isPublished: true,
    rating: 4.5,
    reviewCount: 41,
  },
  {
    name: "Bamboo Desk Organiser",
    slug: "bamboo-desk-organiser",
    description: "Sustainable bamboo construction. 6 compartments. Wireless charging pad integrated.",
    price: 1899,
    images: ["https://picsum.photos/seed/desk/800/800"],
    category: "Home",
    tags: ["desk", "bamboo", "organiser"],
    stock: 80,
    isFeatured: false,
    isPublished: true,
    rating: 4.4,
    reviewCount: 92,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@karta.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@karta.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create test user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@karta.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@karta.com",
      password: userPassword,
      role: "USER",
    },
  });
  console.log(`✅ Test user: ${user.email}`);

  // Create products
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  console.log("✨ Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());