export default function robots() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.agalboutique.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/account"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

