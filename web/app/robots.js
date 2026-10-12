export default function robots() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.agalboutique.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/account", "/admin", "/invoice", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

