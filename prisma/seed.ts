import { PrismaClient, UserRole, StockStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding JOOP COMPAGNY...");

  const adminPassword = await bcrypt.hash("Admin@Joop2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@joop-compagny.com" },
    update: {},
    create: {
      email: "admin@joop-compagny.com",
      name: "Admin JOOP",
      phone: "+221770000001",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("Admin ready:", admin.email);

  const staffPassword = await bcrypt.hash("Staff@Joop2026!", 12);
  await prisma.user.upsert({
    where: { email: "atelier@joop-compagny.com" },
    update: {},
    create: {
      email: "atelier@joop-compagny.com",
      name: "Atelier JOOP",
      phone: "+221770000002",
      passwordHash: staffPassword,
      role: UserRole.STAFF,
      emailVerified: new Date(),
    },
  });

  const customerPassword = await bcrypt.hash("Customer@Joop2026!", 12);
  const customer = await prisma.user.upsert({
    where: { email: "cliente@example.sn" },
    update: {},
    create: {
      email: "cliente@example.sn",
      name: "Awa Ndiaye",
      phone: "+221770000003",
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  await prisma.address.upsert({
    where: { id: "addr-joop-demo-1" },
    update: {},
    create: {
      id: "addr-joop-demo-1",
      userId: customer.id,
      label: "Maison",
      firstName: "Awa",
      lastName: "Ndiaye",
      phone: "+221770000003",
      streetLine1: "Mermoz, rue 15",
      city: "Dakar",
      region: "Dakar",
      isDefault: true,
    },
  });

  const categories = {
    bijoux: await prisma.category.upsert({
      where: { slug: "bijoux" },
      update: {},
      create: {
        name: "Bijoux",
        slug: "bijoux",
        description: "Colliers, bracelets et pieces signatures",
        imageUrl: "/images/products/collier-naya-or.svg",
        sortOrder: 1,
      },
    }),
    parfums: await prisma.category.upsert({
      where: { slug: "parfums" },
      update: {},
      create: {
        name: "Parfums",
        slug: "parfums",
        description: "Eaux de parfum et huiles precieuses",
        imageUrl: "/images/products/parfum-noor.svg",
        sortOrder: 2,
      },
    }),
    encens: await prisma.category.upsert({
      where: { slug: "encens" },
      update: {},
      create: {
        name: "Encens",
        slug: "encens",
        description: "Batons, cones et rituels parfumes",
        imageUrl: "/images/products/encens-terre-rouge.svg",
        sortOrder: 3,
      },
    }),
    coffrets: await prisma.category.upsert({
      where: { slug: "coffrets" },
      update: {},
      create: {
        name: "Coffrets",
        slug: "coffrets",
        description: "Cadeaux prets a offrir",
        imageUrl: "/images/products/coffret-lumiere.svg",
        sortOrder: 4,
      },
    }),
  };

  console.log("Categories ready");

  await prisma.product.upsert({
    where: { slug: "collier-naya-aura" },
    update: {},
    create: {
      name: "Collier Naya Aura",
      slug: "collier-naya-aura",
      description:
        "Une chaine lumineuse pensee pour attirer la lumiere sans alourdir la silhouette. Son volume discret et sa finition miroir en font une piece facile a offrir et a porter.",
      shortDescription: "Chaine signature. Eclat chaud. Pret a offrir.",
      categoryId: categories.bijoux.id,
      brand: "JOOP COMPAGNY",
      basePrice: 32000,
      compareAtPrice: 39000,
      isFeatured: true,
      tags: ["bijou", "collier", "cadeau", "or"],
      images: {
        create: [
          {
            url: "/images/products/collier-naya-or.svg",
            alt: "Collier Naya Aura - Or soleil",
            color: "Or soleil",
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: "/images/products/collier-naya-rose.svg",
            alt: "Collier Naya Aura - Rose cuivre",
            color: "Rose cuivre",
            isPrimary: false,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-NAYA-OR",
            name: "Collier Naya Aura - Or soleil",
            storage: "Taille unique",
            color: "Or soleil",
            colorHex: "#E7B75E",
            price: 32000,
            compareAt: 39000,
            stock: 18,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-NAYA-RC",
            name: "Collier Naya Aura - Rose cuivre",
            storage: "Taille unique",
            color: "Rose cuivre",
            colorHex: "#D88D7A",
            price: 32000,
            stock: 11,
            stockStatus: StockStatus.IN_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "bracelet-sira-glow" },
    update: {},
    create: {
      name: "Bracelet Sira Glow",
      slug: "bracelet-sira-glow",
      description:
        "Un bracelet graphique au volume sculpte, imagine pour superposer textures et reflets. Sa presence subtile habille instantanement un poignet.",
      shortDescription: "Manchette texturee. Contraste chic. Brillance facile.",
      categoryId: categories.bijoux.id,
      brand: "JOOP COMPAGNY",
      basePrice: 28000,
      compareAtPrice: 33000,
      isFeatured: true,
      tags: ["bijou", "bracelet", "signature"],
      images: {
        create: [
          {
            url: "/images/products/bracelet-sira-or.svg",
            alt: "Bracelet Sira Glow - Or sable",
            color: "Or sable",
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: "/images/products/bracelet-sira-onyx.svg",
            alt: "Bracelet Sira Glow - Onyx minuit",
            color: "Onyx minuit",
            isPrimary: false,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-SIRA-OS",
            name: "Bracelet Sira Glow - Or sable",
            storage: "Standard",
            color: "Or sable",
            colorHex: "#C99A4B",
            price: 28000,
            compareAt: 33000,
            stock: 16,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-SIRA-OM",
            name: "Bracelet Sira Glow - Onyx minuit",
            storage: "Standard",
            color: "Onyx minuit",
            colorHex: "#2C2032",
            price: 28500,
            stock: 8,
            stockStatus: StockStatus.IN_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "eau-de-parfum-noor" },
    update: {},
    create: {
      name: "Eau de parfum Noor",
      slug: "eau-de-parfum-noor",
      description:
        "Noor s'ouvre sur des epices lumineuses, glisse vers un coeur floral ambré puis s'installe sur un fond boise, doux et tenace.",
      shortDescription: "Rose ambree. Safran chaud. Sillage durable.",
      categoryId: categories.parfums.id,
      brand: "JOOP COMPAGNY",
      basePrice: 46000,
      compareAtPrice: 52000,
      isFeatured: true,
      tags: ["parfum", "ambre", "cadeau"],
      images: {
        create: [
          {
            url: "/images/products/parfum-noor.svg",
            alt: "Eau de parfum Noor",
            color: "Ambre rubis",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-NOOR-50",
            name: "Eau de parfum Noor 50 ml",
            storage: "50 ml",
            color: "Ambre rubis",
            colorHex: "#A84B45",
            price: 46000,
            compareAt: 52000,
            stock: 14,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-NOOR-100",
            name: "Eau de parfum Noor 100 ml",
            storage: "100 ml",
            color: "Ambre rubis",
            colorHex: "#A84B45",
            price: 69000,
            stock: 7,
            stockStatus: StockStatus.LOW_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "huile-parfum-kora" },
    update: {},
    create: {
      name: "Huile de parfum Kora",
      slug: "huile-parfum-kora",
      description:
        "Une huile parfumee a la texture soyeuse, enrichie d'accords floraux, ambrés et musques pour un luxe plus intime et enveloppant.",
      shortDescription: "Huile parfumee. Floral ambre. Pres de la peau.",
      categoryId: categories.parfums.id,
      brand: "JOOP COMPAGNY",
      basePrice: 24000,
      compareAtPrice: 28000,
      isFeatured: false,
      tags: ["huile", "parfum", "rituel"],
      images: {
        create: [
          {
            url: "/images/products/huile-kora.svg",
            alt: "Huile de parfum Kora",
            color: "Sable dore",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-KORA-30",
            name: "Huile de parfum Kora 30 ml",
            storage: "30 ml",
            color: "Sable dore",
            colorHex: "#D0A15E",
            price: 24000,
            compareAt: 28000,
            stock: 13,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-KORA-50",
            name: "Huile de parfum Kora 50 ml",
            storage: "50 ml",
            color: "Sable dore",
            colorHex: "#D0A15E",
            price: 34000,
            stock: 9,
            stockStatus: StockStatus.IN_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "encens-terre-rouge" },
    update: {},
    create: {
      name: "Encens Terre Rouge",
      slug: "encens-terre-rouge",
      description:
        "Un melange chaleureux de bois, resines et epices qui installe une ambiance enveloppante des les premieres minutes.",
      shortDescription: "Boise epice. Atmosphere chaude. Rituel quotidien.",
      categoryId: categories.encens.id,
      brand: "JOOP COMPAGNY",
      basePrice: 12000,
      compareAtPrice: 15000,
      isFeatured: true,
      tags: ["encens", "boise", "interieur"],
      images: {
        create: [
          {
            url: "/images/products/encens-terre-rouge.svg",
            alt: "Encens Terre Rouge",
            color: "Terre safran",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-TR-20",
            name: "Encens Terre Rouge 20 batons",
            storage: "20 batons",
            color: "Terre safran",
            colorHex: "#C3693D",
            price: 12000,
            compareAt: 15000,
            stock: 20,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-TR-40",
            name: "Encens Terre Rouge 40 batons",
            storage: "40 batons",
            color: "Terre safran",
            colorHex: "#C3693D",
            price: 19000,
            stock: 10,
            stockStatus: StockStatus.IN_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "encens-nuit-fleurie" },
    update: {},
    create: {
      name: "Encens Nuit Fleurie",
      slug: "encens-nuit-fleurie",
      description:
        "Des notes florales veloutees habillees d'un voile fumé pour un rituel du soir plus doux, plus intime et plus enveloppant.",
      shortDescription: "Fleurs velours. Fumee douce. Rituel du soir.",
      categoryId: categories.encens.id,
      brand: "JOOP COMPAGNY",
      basePrice: 14500,
      compareAtPrice: 18000,
      isFeatured: false,
      tags: ["encens", "floral", "soir"],
      images: {
        create: [
          {
            url: "/images/products/encens-nuit-fleurie.svg",
            alt: "Encens Nuit Fleurie",
            color: "Violet nuit",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-NF-12",
            name: "Encens Nuit Fleurie 12 cones",
            storage: "12 cones",
            color: "Violet nuit",
            colorHex: "#693A8A",
            price: 14500,
            compareAt: 18000,
            stock: 12,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-NF-24",
            name: "Encens Nuit Fleurie 24 cones",
            storage: "24 cones",
            color: "Violet nuit",
            colorHex: "#693A8A",
            price: 22000,
            stock: 6,
            stockStatus: StockStatus.LOW_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "coffret-lumiere-dakar" },
    update: {},
    create: {
      name: "Coffret Lumiere de Dakar",
      slug: "coffret-lumiere-dakar",
      description:
        "Un coffret compose pour offrir la boutique en un geste: un bijou signature, un parfum et un encens selectionne dans une presentation chaleureuse.",
      shortDescription: "Bijou, parfum, encens. Edition vibrante.",
      categoryId: categories.coffrets.id,
      brand: "JOOP COMPAGNY",
      basePrice: 78000,
      compareAtPrice: 92000,
      isFeatured: true,
      tags: ["coffret", "cadeau", "selection"],
      images: {
        create: [
          {
            url: "/images/products/coffret-lumiere.svg",
            alt: "Coffret Lumiere de Dakar",
            color: "Lumiere",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-LUM-3",
            name: "Coffret Lumiere de Dakar 3 pieces",
            storage: "3 pieces",
            color: "Lumiere",
            colorHex: "#F6C668",
            price: 78000,
            compareAt: 92000,
            stock: 9,
            stockStatus: StockStatus.IN_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-LUM-5",
            name: "Coffret Lumiere de Dakar 5 pieces",
            storage: "5 pieces",
            color: "Lumiere",
            colorHex: "#F6C668",
            price: 118000,
            stock: 4,
            stockStatus: StockStatus.LOW_STOCK,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "coffret-rituel-precieux" },
    update: {},
    create: {
      name: "Coffret Rituel Precieux",
      slug: "coffret-rituel-precieux",
      description:
        "Une composition premium qui superpose detail bijou, parfum enveloppant et encens d'ambiance pour un cadeau plus dense et plus ceremoniel.",
      shortDescription: "Superposition de gestes. Edition premium.",
      categoryId: categories.coffrets.id,
      brand: "JOOP COMPAGNY",
      basePrice: 125000,
      compareAtPrice: 149000,
      isFeatured: true,
      tags: ["coffret", "premium", "cadeau"],
      images: {
        create: [
          {
            url: "/images/products/coffret-signature.svg",
            alt: "Coffret Rituel Precieux",
            color: "Prune royale",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "JC-RIT-4",
            name: "Coffret Rituel Precieux 4 pieces",
            storage: "4 pieces",
            color: "Prune royale",
            colorHex: "#5C2D6D",
            price: 125000,
            compareAt: 149000,
            stock: 5,
            stockStatus: StockStatus.LOW_STOCK,
            isDefault: true,
          },
          {
            sku: "JC-RIT-6",
            name: "Coffret Rituel Precieux 6 pieces",
            storage: "6 pieces",
            color: "Prune royale",
            colorHex: "#5C2D6D",
            price: 165000,
            stock: 3,
            stockStatus: StockStatus.LOW_STOCK,
          },
        ],
      },
    },
  });

  console.log("Products ready");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
