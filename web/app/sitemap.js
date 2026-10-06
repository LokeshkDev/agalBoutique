import { getAllSlugs, getCategories } from "@/lib/api";

export default function sitemap() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.agalboutique.com";
  const products = getAllSlugs();
  const categories = getCategories();

  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categories.map((c) => ({
      url: `${SITE}/shop?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}

