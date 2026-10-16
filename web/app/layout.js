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
    default: "Agal Boutique - Plus Size Ethnic Wear & Sets | Tops with Dupatta & Full Sets (Sizes 34-56)",
    template: "%s | Agal Boutique - Plus Size Ethnic Wear Store",
  },
  description:
    "Agal Boutique is India's premier plus-size ethnic wear destination specialized in premium quality sizes 34 to 56 (XS to 6XL). Explore 100+ varieties of sets, 2-piece & 3-piece full sets, straight cut suits, and tops with dupatta with easy availability, cash on delivery, and express shipping across India.",
  keywords: [
    "Agal Boutique",
    "plus size ethnic wear",
    "plus size boutique India",
    "plus size sets",
    "plus size full sets",
    "tops with dupatta",
    "top with dupatta 2 piece set",
    "3 piece full sets plus size",
    "straight cut 3 piece set",
    "anarkali 3 piece set",
    "umbrella top with dupatta",
    "sizes M to 7XL women ethnic wear",
    "plus size kurtis online",
    "100+ varieties plus size ethnic wear",
    "premium quality plus size store",
    "easy availability plus size suits",
    "curvy women ethnic fashion India",
    "pure cotton plus size sets",
    "plus size western wear and festival wear",
  ],
  authors: [{ name: "Agal Boutique" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.agalboutique.com",
    siteName: "Agal Boutique",
    title: "Agal Boutique - Plus Size Varieties, Western & Festival Wear | Tops with Dupatta & Full Sets (M to 7XL)",
    description:
      "Specialized in plus size varieties (M to 7XL), festival season collections, premium quality fabrics, western wear, festival wear, 2-piece & 3-piece full sets, and tops with dupatta with easy availability across India.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Agal Boutique - Plus Size Ethnic Wear Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agal Boutique | Plus Size Ethnic Wear, Sets & Tops with Dupatta",
    description:
      "Specialized in premium quality plus-size ethnic wear, 100+ varieties of full sets, tops with dupatta, and sizes 34 to 56 with easy availability.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Agal Boutique",
    image: "https://www.agalboutique.com/logo.png",
    description:
      "India's premier plus-size ethnic wear boutique specialized in premium quality sizes 34 to 56 (XS to 6XL), 100+ varieties of sets, full sets, and tops with dupatta with easy availability across India.",
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
      data-scroll-behavior="smooth"
      className={`${roboto.variable} ${roboto.className} ${notoTamil.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://agalboutique.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://agalboutique.onrender.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </head>
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
