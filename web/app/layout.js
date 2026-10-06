import { Roboto, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CartSheet from "@/components/CartSheet";
import JsonLd from "@/components/JsonLd";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-app-roboto",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.agalboutique.com"
  ),
  title: {
    default: "Agal Boutique | Handcrafted Women's Fashion & Custom Stitching",
    template: "%s | Agal Boutique",
  },
  description:
    "Handcrafted sarees, kurtis, lehenga sets, and bespoke custom stitching from Tamil Nadu. Shipped across India with easy returns.",
  keywords: [
    "Agal Boutique",
    "women's boutique Chennai",
    "sarees online India",
    "custom blouse stitching",
    "cotton kurtis",
    "lehenga sets",
    "Tamil Nadu boutique",
  ],
  authors: [{ name: "Agal Boutique" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.agalboutique.com",
    siteName: "Agal Boutique",
    title: "Agal Boutique | Handcrafted Women's Fashion & Custom Stitching",
    description:
      "Handcrafted sarees, kurtis, lehenga sets, and bespoke custom stitching from Tamil Nadu.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Agal Boutique Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agal Boutique | Handcrafted Women's Fashion",
    description:
      "Handcrafted sarees, kurtis, lehenga sets, and bespoke custom stitching from Tamil Nadu.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Agal Boutique",
    image: "https://www.agalboutique.com/logo.png",
    description:
      "Boutique offering sarees, kurtis, lehengas, blouses and bespoke custom stitching across India.",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Net Banking",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
  };

  return (
    <html
      lang="en-IN"
      className={`${roboto.variable} ${roboto.className} ${notoTamil.variable}`}
    >
      <body className={`${roboto.className} min-h-screen flex flex-col bg-white text-ink antialiased pb-[64px] lg:pb-0 font-sans`}>
        <JsonLd data={storeSchema} />
        <Header />
        <main className="flex-1">{children}</main>
        <BottomNav />
        <CartSheet />
      </body>
    </html>
  );
}
