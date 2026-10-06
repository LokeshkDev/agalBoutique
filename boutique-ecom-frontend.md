# Boutique E-commerce Frontend Rules (Agal Boutique)

> Use when building or editing any part of the women's boutique e-commerce website: Next.js (App Router) + React + Node/Express, plain JavaScript (no TypeScript), SEO/GEO friendly, mobile-first. Applies to homepage, shop, product page, cart drawer, checkout, components and backend.

# Boutique E-commerce Frontend

Build a women's boutique store that looks designed by a person, not generated. The look is warm, editorial and quiet; the behaviour is fast and familiar like Meesho / Myntra on a phone. The same mobile layout scales up to desktop instead of becoming a different site.

## How this file is organised

Everything is in this one file: Brand, Rules, Workflow, then Part A (design system), Part B (page templates), Part C (tech stack), Part D (SEO + GEO), Part E (design tokens CSS). Use the part that matches the task.

## The brand (default: Agal Boutique)

The logo is a dress-form (mannequin) with a plum crown, a crimson-and-blue-and-green swirl, and a large "AB" monogram in plum and crimson, with a bold serif wordmark. Pull the theme from it:

- **Plum** `#8A2A6F` is the main brand colour (headings, primary buttons, nav).
- **Crimson** `#E3174B` is the action/sale colour (Add to bag, discount tags, active states). Use it sparingly so it still feels special.
- **Leaf green** `#1E8E4E` and **sky blue** `#1F8DC9` come from the swirl. Green means "good" (in stock, ratings, savings). Blue is only for info links. Neither is ever a button colour.
- Backgrounds are warm ivory and blush, never pure white and never grey.

If the user supplies a different logo, sample its 2-3 dominant colours and rebuild the token scale in Part E tokens (`styles/tokens.css`) the same way (one deep brand colour, one action colour, warm neutrals tinted toward the brand hue). Check text contrast is at least 4.5:1.

## What makes it not look AI-generated

Models drift to the same defaults. Avoid every item here, and say what you used instead in a line or two when you present the work.

- No Inter, Roboto, Poppins, Montserrat or Playfair Display. Use the fonts in the design system.
- No purple-to-blue gradients, glassmorphism, neon glows, or gradient buttons.
- No emoji as icons, no default Lucide/Heroicons set, no icon-in-a-circle feature trio.
- No centred hero with a headline, subline and two buttons over a stock photo. Use the asymmetric arch-frame hero.
- No "Welcome to our store", "Elevate your style", "Discover the collection". Write concrete copy: fabric, fit, delivery days, stitching time.
- No default Tailwind palette classes (`bg-purple-500`). Colours come only from the brand tokens.
- No scroll-triggered reveal animations, parallax, auto-playing carousels or marquees.
- Shapes echo the logo: arch-top frames, soft pills, one swirl/curl accent used at most once per page.

## Experience rules (Meesho / Myntra feel)

1. **Design mobile first at 360-430px**, then tablet, then desktop. Desktop reuses the same components: grid columns grow 2 → 3 → 4 → 5, the bottom tab bar becomes a top nav, the bottom sheet becomes a right-side drawer. Do not invent separate desktop-only layouts.
2. **Homepage has exactly 5 sections** (hero, categories, new arrivals, best sellers/offer, trust + story) plus footer. No more.
3. **Pages are only**: Home, Shop (listing), Product detail, Checkout, plus small account/order pages. **Cart is never a page.** It is a bottom sheet on mobile and a right drawer on desktop, opened from the bag icon and after Add to bag.
4. **Sticky bottom action bar** on product detail (Wishlist + Add to bag) and on Shop (Sort + Filter), as Myntra does.
5. **Dense, scannable product grid**: 2 columns on phones, compact price row, discount % visible, no hover-only information.
6. **Minimal motion**: 150-220ms, only press feedback, drawer slide, image fade-in, wishlist heart pop. Honour `prefers-reduced-motion`.
7. **India-ready**: ₹ prices, UPI and COD, PIN-code delivery check, WhatsApp order/enquiry button, size guide, Tamil font fallback.

## Workflow

1. Confirm what is being built (full site, one page, or one component) and which brand colours apply. If a logo is attached, derive tokens from it. Do not ask more than one question; assume sensible defaults and state them.
2. Copy Part E tokens (`styles/tokens.css`) into the project and wire fonts per Part A.
3. Build shared components first: `Button`, `IconButton`, `Chip`, `PriceTag`, `ProductCard`, `Sheet` (drawer/bottom sheet), `Header`, `BottomNav`.
4. Build pages from Part B, using Server Components for anything that should be indexed.
5. Add metadata and JSON-LD from Part D as each page is built, not at the end.
6. Check against the checklist below before presenting.

## Code rules

- JavaScript only: `.js` / `.jsx` files, `jsconfig.json` for the `@/` alias. JSDoc comments for shapes are fine. No `.ts`/`.tsx`.
- Next.js App Router. Server Components by default; add `"use client"` only for the cart, filters, gallery, forms and drawers.
- Semantic HTML first (`header`, `nav`, `main`, `section`, `article`, `footer`, one `h1` per page), then CSS.
- Every image uses `next/image` with real `alt` text, explicit sizes, and `priority` only on the first hero/product image.
- Touch targets at least 44px. Visible `:focus-visible` ring in plum.
- Never trust client-side prices: the server recalculates totals at checkout.
- Keep components small and named plainly so a beginner can follow them.

## Final checklist

- [ ] Colours only from tokens; plum/crimson/ivory feel matches the logo
- [ ] Fonts: Instrument Serif (display), Hanken Grotesk (body), Noto Sans Tamil fallback
- [ ] Phosphor icons (light weight), none from other sets, no emoji
- [ ] Pill buttons with the arrow-chip primary; no gradients
- [ ] Home has 5 sections only; cart is a drawer/sheet, not a page
- [ ] Looks right at 360px first, then 768px, then 1280px with the same components
- [ ] One `h1`, metadata, canonical, JSON-LD on Home, Shop, Product
- [ ] Lighthouse mobile: Performance, Accessibility, SEO all 90+
- [ ] No TypeScript anywhere

---

# Part A: Design System

Contents: Typography · Icons · Buttons · Chips and tags · Product card · Shapes · Motion · Spacing

## Typography

Pair an editorial serif for display with a clean, warm grotesk for UI. Both are free on Google Fonts and load through `next/font` (no layout shift, self-hosted).

| Role | Font | Use |
|---|---|---|
| Display | **Instrument Serif** (regular + italic) | h1, h2, hero lines, price on product page |
| Body / UI | **Hanken Grotesk** (400, 500, 600) | everything else, buttons, prices in cards |
| Tamil | **Noto Sans Tamil** / **Noto Serif Tamil** | fallback in the stack, so Tamil text never falls to a system font |

Italic Instrument Serif is the signature: set one or two words per heading in italic plum or crimson ("Sarees, *stitched* for you"). Do it once per section at most.

```js
// app/layout.js
import { Instrument_Serif, Hanken_Grotesk } from "next/font/google";

const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${instrument.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Scale (mobile → desktop): h1 `clamp(2.25rem, 7vw, 4.5rem)`, h2 `clamp(1.75rem, 4.5vw, 3rem)`, body 15-16px, small 13px, price 16px/600. Never go below 13px. Uppercase micro-labels: 11-12px, `letter-spacing: .08em`, weight 600, used for tags only.

## Icons

Use **Phosphor Icons** (`@phosphor-icons/react`), **light** weight for UI, **fill** weight only for active/selected states (heart, bag count, active tab). The light weight has a refined, current look that default Lucide/Heroicons lack.

```js
import { Handbag, Heart, MagnifyingGlass, ArrowUpRight, SlidersHorizontal, SortAscending, House, SquaresFour, User } from "@phosphor-icons/react/dist/ssr";
<Handbag size={24} weight="light" />
```

Import from `/dist/ssr` in Server Components; use the main entry inside `"use client"` files. Icon size 22-24px in nav, 18-20px inside buttons. Stroke colour follows `currentColor`.

Brand glyph: build one custom inline SVG of the dress-form silhouette (from the logo) for the empty-cart and 404 states and as a favicon. This is the only custom illustration; do not add decorative clip-art.

## Buttons

Trendy but quiet: pill shapes, solid fills, a small arrow chip, tactile press. No gradients, no glow, no shine sweep.

```css
.btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; min-height:48px; padding:0 22px;
  border-radius:var(--radius-pill); font:600 15px/1 var(--font-body); letter-spacing:.01em; cursor:pointer;
  border:1.5px solid transparent; transition: transform var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease); }
.btn:active { transform: scale(.98); }

/* Primary: plum pill with a crimson arrow chip at the end (hero, "Shop now", "Checkout") */
.btn-primary { background:var(--plum-600); color:var(--ivory); padding-right:8px; }
.btn-primary:hover { background:var(--plum-700); }
.btn-primary .chip { width:32px; height:32px; border-radius:50%; background:var(--crimson-600); display:grid; place-items:center; }

/* Action: solid crimson (Add to bag, Pay now). Only one per screen */
.btn-action { background:var(--crimson-600); color:#fff; }
.btn-action:hover { background:var(--crimson-700); }

/* Secondary: outline */
.btn-outline { background:transparent; color:var(--plum-600); border-color:var(--plum-600); }
.btn-outline:hover { background:var(--plum-50); }

/* Text link: underline offset, no animation beyond colour */
.link { color:var(--plum-600); text-decoration:underline; text-underline-offset:4px; text-decoration-thickness:1px; font-weight:500; }
```

Rules: one primary or action button per viewport; full width on mobile inside sheets and sticky bars; disabled = 40% opacity with `aria-disabled`; loading = replace label with a small dotted spinner and keep the width.

## Chips and tags

- **Filter chip**: pill, 1px `--line` border, 36px high, selected = plum fill + ivory text + `Check` icon.
- **Size chip**: 44px square-ish pill, selected = plum border 1.5px + `--plum-50` fill; out of stock = diagonal strike, 50% opacity.
- **Discount tag**: `--leaf-600` text, bold, "32% off". Not a sticker or badge, plain text next to price.
- **Label tag** ("New", "Handloom"): 11px uppercase, blush background, plum text, radius 6px.
- **Rating chip**: leaf-100 background, leaf-600 text, `Star` fill icon 12px, "4.3".

## Product card (Meesho-dense)

- Image 3:4, radius 16px, `object-fit: cover`, soft blush placeholder (`--blush`), heart `IconButton` top-right on a translucent ivory circle (flat, no blur).
- Under the image: name (14px, 2 lines max, ink), price row: **₹799** (600) · ~~₹1,499~~ (muted, strike) · **47% off** (leaf).
- Optional line: rating chip + "Free delivery" in muted 12px. Nothing else. No Add-to-cart button on the card; tap opens the product page (faster grids).
- Grid: `grid-template-columns: repeat(2, 1fr); gap: 12px` → 3 at ≥640px → 4 at ≥1024px → 5 at ≥1360px.

## Shapes

- **Arch frame** (`border-radius: var(--arch)`) for the hero image and category tiles. This is the boutique signature and mirrors the monogram curves.
- Cards and sheets: 16-24px radius. Never mix sharp and round corners on the same screen.
- Borders 1px `--line`; shadows only on sheets and popovers.
- Optional single swirl: one thin plum curve SVG behind the hero. Not repeated.

## Motion (minimal)

| Allowed | Spec |
|---|---|
| Button press | `scale(.98)`, 150ms |
| Drawer / bottom sheet | translate in 220ms `--ease`, backdrop fade 150ms |
| Image load | opacity 0→1, 220ms |
| Wishlist heart | one 180ms scale pop on toggle |

Anything else (reveal-on-scroll, parallax, hover zoom on every card, auto-sliding banners) is out. Respect `prefers-reduced-motion`.

## Spacing

4px base. Section padding 40px mobile / 72px desktop. Container max 1280px with `--gutter` side padding. Keep generous whitespace around the hero and category tiles but stay tight in product grids (12px gaps).

---

# Part B: Page Templates

Contents: App shell · Home (5 sections) · Shop · Product detail · Cart drawer · Checkout · Responsive mapping

Design every layout at 390px first. The desktop version is the same blocks with more columns and a top nav.

## App shell

**Mobile**
- Top bar (56px): logo left, search icon, bag icon with count (crimson dot). Sticks on scroll.
- Bottom tab bar (64px, ivory, 1px top line): Home · Shop · Wishlist · Account. Active tab uses the filled Phosphor icon in plum plus a 4px crimson dot, no label animation.
- Floating WhatsApp button only on Home and Product, bottom-right above the tab bar.

**Desktop (≥1024px)**: the tab bar disappears; the same four links move into the top bar next to the logo, search becomes an inline field, bag icon opens the right drawer.

## Home: exactly 5 sections

1. **Hero.** Left: small uppercase label ("Handpicked · Chennai"), h1 with one italic word, one line of concrete copy (fabric, stitching time), the primary arrow-chip button. Right (below on mobile): one arch-framed photo. No slider. Stack on mobile, 12-column split 5/7 on desktop.
2. **Shop by category.** Horizontally scrollable row of arch tiles on mobile (snap, no autoplay); a 6-up grid on desktop. 6 categories max (Sarees, Kurtis, Lehengas, Blouses, Kidswear, Custom stitching). Label under each tile.
3. **New arrivals.** Section heading + "View all" link, then the standard product grid, 4 items on mobile (2×2), 8 on desktop. Server-rendered.
4. **Best sellers with an offer strip.** One slim blush banner above a horizontal product row (peek of the next card to show it scrolls). The banner holds one offer line and the coupon code, nothing more.
5. **Trust + story.** Two-column block: left, 3 short text lines on how orders work (measure → stitch → deliver, delivery days, easy returns) written as plain sentences, not icon cards; right, a small photo of the studio and a "Chat on WhatsApp" outline button. Footer follows.

No testimonials carousel, no Instagram feed embed, no newsletter popup. If the user wants a newsletter, put one field in the footer.

## Shop (listing)

- Heading `h1` (e.g. "Sarees") with count in muted text. Category chips row beneath (scrollable).
- **Mobile**: sticky bottom bar with two halves, `Sort` and `Filter` (Phosphor `SortAscending`, `SlidersHorizontal`). Each opens a bottom sheet. Filter sheet: price range, size, fabric, colour swatches, occasion; sticky "Show 128 items" action button.
- **Desktop**: left sidebar with the same filter groups (collapsible), sort as a select top-right. No sticky bottom bar.
- Grid per design system. Infinite scroll with a visible "Load more" button fallback (better for crawlers and a11y); use `?page=` URLs and `rel="next"` metadata so pages are indexable. Filters write to the URL query so results are shareable.
- Empty state: dress-form glyph, one line, "Clear filters" button.

## Product detail

- **Mobile**: swipeable image gallery (3:4, dots, pinch not required), then title, price row, rating, offer line, size chips (with "Size guide" link), PIN-code delivery check, accordion for Details / Fabric & care / Returns, then similar items grid.
- **Sticky bottom bar**: `Wishlist` (outline icon button) + `Add to bag` (crimson, flex 1). If no size chosen, tapping scrolls to the size chips and shakes nothing; it shows the error text "Pick a size".
- **Desktop**: gallery left (thumbnails vertical + main image), details right in a sticky column. The sticky bar becomes inline buttons.
- Add to bag opens the cart drawer, so the user sees confirmation with no page change.
- "Custom stitching" option: a small inline form (blouse measurements, notes) shown only for stitched categories.

## Cart: drawer, never a page

One `Sheet` component, two presentations:
- **Mobile**: bottom sheet, up to 85vh, drag handle, backdrop; slides up 220ms.
- **Desktop**: right drawer 420px wide, full height.

Contents top to bottom: header ("Your bag · 2") and close icon; free-delivery progress ("Add ₹300 more for free delivery", thin plum bar); line items (thumb 64×86, name, size, quantity stepper, price, remove); coupon field (collapsed link "Have a code?"); sticky footer with subtotal, savings in leaf green, and the primary `Checkout` button. Empty state uses the dress-form glyph and a "Start shopping" button.

State lives in a small client store (Zustand with `persist`). The drawer is mounted once in the root layout and opened through the store, so it works from every page.

## Checkout (single page)

One page at `/checkout`, guest friendly, steps as stacked accordion cards so the user sees progress without leaving the page:

1. **Contact**: mobile number + OTP (or email). Show "Returning customer? Log in".
2. **Address**: name, phone, PIN code (auto-fills city and state), address lines, save-as chips (Home / Work). Mobile keyboard types set correctly (`inputmode="numeric"` for PIN).
3. **Delivery**: standard / express as radio cards with dates.
4. **Payment**: UPI (Razorpay), cards, netbanking, COD (with fee note if any).

Order summary: collapsed "Show order summary ₹1,899" bar at the top on mobile; fixed right column on desktop. Sticky bottom `Pay ₹1,899` action button on mobile. Totals are recomputed on the server; show the server's numbers. Confirmation page: order number, expected delivery, WhatsApp share, "Continue shopping".

## Responsive mapping

| Block | 360-639px | 640-1023px | ≥1024px |
|---|---|---|---|
| Navigation | top bar + bottom tabs | same | top bar with links, no tabs |
| Product grid | 2 cols | 3 cols | 4 cols (5 at ≥1360) |
| Filters | bottom sheet | bottom sheet | left sidebar |
| Cart | bottom sheet | right drawer 380px | right drawer 420px |
| Product page | stacked + sticky bar | stacked, wider gallery | 2 columns, sticky details |
| Checkout | accordion + sticky pay bar | accordion | accordion + summary column |

---

# Part C: Tech Stack (plain JavaScript, no TypeScript)

Contents: The stack in one table · Project layout · Setup · Frontend patterns · Backend (Node) · Payments · Security · Deploy

## The stack in one table

| Layer | Choice | Why (in simple words) |
|---|---|---|
| Framework | **Next.js 15 (App Router), React 19** | Pages are built on the server, so Google and AI search can read them; also fast on phones |
| Language | **JavaScript** (`.js`/`.jsx`) | As requested; use JSDoc comments if you want hints |
| Styling | **Tailwind CSS v4** + Part E tokens (`styles/tokens.css`) | Colours and fonts come from our tokens, not Tailwind defaults |
| Icons | **@phosphor-icons/react** | Current, light-weight look |
| Cart/UI state | **Zustand** (with `persist`) | Tiny, easy cart store that survives refresh |
| Forms | **react-hook-form** + **zod** | Simple validation; zod works fine in JavaScript |
| API server | **Node 20+ with Express** (separate `server/` folder) | Clear split: Next shows pages, Express handles data and payments |
| Database | **MongoDB Atlas** with **Mongoose** | Flexible product data (sizes, fabrics, variants) |
| Images | **Cloudinary** + `next/image` | Auto-resizes images for each device |
| Payments | **Razorpay** (UPI, cards, netbanking, COD flag) | Standard in India |
| Auth | **Phone OTP** (MSG91/Twilio) → **JWT in httpOnly cookie** | Familiar for Indian shoppers, safer than localStorage |
| Email/WhatsApp | Resend/Brevo for email, WhatsApp click-to-chat link | Order mails and easy support |
| Hosting | Next on **Vercel**, API on **Render/Railway**, DB on Atlas | All have free or cheap starting tiers |

## Project layout

```
agal-boutique/
├─ web/                     # Next.js app
│  ├─ app/
│  │  ├─ layout.js          # fonts, header, bottom nav, cart sheet
│  │  ├─ page.js            # Home (5 sections)
│  │  ├─ shop/page.js       # listing  (?category=&page=&sort=)
│  │  ├─ product/[slug]/page.js
│  │  ├─ checkout/page.js
│  │  ├─ sitemap.js  robots.js  not-found.js
│  │  └─ (account)/orders/page.js
│  ├─ components/           # Button, Sheet, ProductCard, PriceTag, ...
│  ├─ lib/                  # api.js (fetch helper), format.js, seo.js
│  ├─ store/cart.js
│  ├─ styles/globals.css    # imports tokens.css
│  ├─ public/               # logo, favicon, llms.txt
│  └─ jsconfig.json         # { "compilerOptions": { "paths": { "@/*": ["./*"] } } }
└─ server/                  # Express API
   └─ src/
      ├─ index.js           # app setup
      ├─ config/            # env, db connection
      ├─ models/            # Product, Order, User, Coupon
      ├─ routes/            # products.js, orders.js, auth.js, payments.js
      ├─ controllers/
      ├─ middleware/        # auth, validate, errorHandler, rateLimit
      └─ services/          # razorpay.js, otp.js, mailer.js
```

## Setup

```bash
npx create-next-app@latest web --js --app --tailwind --eslint --no-src-dir --import-alias "@/*"
cd web && npm i @phosphor-icons/react zustand react-hook-form zod
cd .. && mkdir server && cd server && npm init -y
npm i express mongoose cors helmet express-rate-limit cookie-parser jsonwebtoken zod razorpay dotenv compression
npm i -D nodemon      # set "type": "module" and "dev": "nodemon src/index.js"
```

## Frontend patterns

**Fetch on the server, cache sensibly.**

```js
// web/lib/api.js
const API = process.env.API_URL;
export async function getProducts(query = "") {
  const res = await fetch(`${API}/products?${query}`, { next: { revalidate: 300, tags: ["products"] } });
  if (!res.ok) throw new Error("Could not load products");
  return res.json();
}
```

Home, Shop and Product pages are Server Components that call these helpers, so the HTML Google receives already contains the products. Revalidate on admin edits with `revalidateTag("products")`.

**Cart store (client).**

```js
// web/store/cart.js
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(persist((set, get) => ({
  items: [], open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
  add: (item) => set((s) => {
    const i = s.items.find((x) => x.id === item.id && x.size === item.size);
    const items = i ? s.items.map((x) => (x === i ? { ...x, qty: x.qty + 1 } : x)) : [...s.items, { ...item, qty: 1 }];
    return { items, open: true };
  }),
  setQty: (id, size, qty) => set((s) => ({ items: s.items.map((x) => (x.id === id && x.size === size ? { ...x, qty } : x)).filter((x) => x.qty > 0) })),
  subtotal: () => get().items.reduce((t, x) => t + x.price * x.qty, 0),
}), { name: "ab-cart" }));
```

Store only `id`, `size`, `qty` plus display fields; the server re-prices on checkout.

**Drawer / bottom sheet.** One `Sheet` client component: `position: fixed`, `inset-x-0 bottom-0 rounded-t-[24px]` on mobile, `md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:rounded-none` on desktop. Trap focus, close on Esc and backdrop click, lock body scroll, `role="dialog" aria-modal="true"`.

## Backend (Node + Express)

```js
// server/src/index.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import auth from "./routes/auth.js";
import payments from "./routes/payments.js";

const app = express();
app.use(helmet(), compression(), cookieParser(), express.json({ limit: "100kb" }));
app.use(cors({ origin: process.env.WEB_URL, credentials: true }));
app.use("/api", rateLimit({ windowMs: 60_000, max: 120 }));
app.use("/api/products", products);
app.use("/api/auth", auth);
app.use("/api/orders", orders);
app.use("/api/payments", payments);
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message || "Server error" }));

await connectDB();
app.listen(process.env.PORT || 5000);
```

**Product model (fields that matter for SEO and UX):**

```js
// server/src/models/Product.js
import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  category: { type: String, index: true },
  description: String,                     // 2-3 plain sentences, used in meta + JSON-LD
  fabric: String, care: String, occasion: [String],
  price: { type: Number, required: true }, mrp: Number,
  sizes: [{ label: String, stock: Number }],
  images: [{ url: String, alt: String }],
  rating: { avg: Number, count: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ name: "text", description: "text", fabric: "text" });
export default mongoose.model("Product", productSchema);
```

API endpoints: `GET /products` (filters, sort, pagination), `GET /products/:slug`, `POST /orders` (re-prices cart on server), `POST /payments/razorpay/order`, `POST /payments/razorpay/verify`, `POST /auth/otp/send`, `POST /auth/otp/verify`, `GET /orders/mine`.

## Payments (Razorpay flow)

1. Checkout calls `POST /orders` with `{id, size, qty}` items and the address. Server loads prices from the DB, applies coupon, computes total, saves order as `pending`.
2. Server creates a Razorpay order for that total (in paise) and returns the order id.
3. Browser opens Razorpay Checkout with the order id.
4. On success, browser sends `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to `/payments/razorpay/verify`.
5. Server verifies the HMAC-SHA256 signature with the secret key, marks the order `paid`, reduces stock, sends confirmation. Also handle the Razorpay webhook as backup.

## Security basics

Validate every body with zod, hash nothing you do not need to store, use httpOnly + `sameSite=lax` + `secure` cookies for the JWT, rate-limit OTP sends (3 per 10 minutes per number), never expose secret keys to the browser (only `NEXT_PUBLIC_` vars are public), sanitise Mongo queries (reject keys starting with `$`), and keep `.env` out of git.

## Deploy checklist

Set `API_URL`, `WEB_URL`, `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_URL`. Add the production domain to CORS and Razorpay. Run `next build` locally first and fix warnings.

---

# Part D: SEO + GEO

Contents: What SEO and GEO mean here · Rendering rules · Metadata · JSON-LD · Sitemap and robots · llms.txt · Writing for AI answers · Local signals · Performance

**SEO** = ranking in Google/Bing. **GEO** (generative engine optimisation) = being quoted accurately by AI answer tools (ChatGPT, Gemini, Perplexity, Google AI Overviews). Both reward the same things: pages the crawler can read without running JavaScript, clear structured data, and short factual answers.

## Rendering rules

- Home, Shop, Product and category pages are Server Components (or ISR with `revalidate`). Product names, prices and descriptions must be in the first HTML response.
- Cart, filters, gallery and checkout are client components. They do not need indexing.
- One `h1` per page, then `h2`/`h3` in order. Use `<nav aria-label>`, `<main>`, `<article>` for product, `<section aria-labelledby>`.
- Clean URLs: `/shop/sarees`, `/product/kanchipuram-silk-saree-maroon`. Keep filters in query strings and canonicalise to the base listing.
- Out-of-stock products stay live (status `OutOfStock` in schema). Deleted ones return 410/404 with a link to the category.

## Metadata (App Router)

```js
// app/product/[slug]/page.js
import { getProduct } from "@/lib/api";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  const title = `${p.name} | Agal Boutique`;
  const description = `${p.description.slice(0, 150)} ₹${p.price}. Free delivery above ₹999.`;
  return {
    title, description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title, description, type: "website", url: `/product/${p.slug}`, images: [{ url: p.images[0].url, width: 1200, height: 1600, alt: p.images[0].alt }] },
    twitter: { card: "summary_large_image", title, description, images: [p.images[0].url] },
  };
}
```

Set `metadataBase: new URL("https://www.yourdomain.com")` once in `app/layout.js`, plus `title.template: "%s | Agal Boutique"`, `lang="en-IN"`, and `icons`. Titles 50-60 characters, descriptions 120-155, written for a person.

## JSON-LD (structured data)

Render as a server component with a `<script type="application/ld+json">`. Escape `<` to avoid injection.

```js
// components/JsonLd.js
export default function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
```

**Product page** (Product + Offer + AggregateRating + BreadcrumbList):

```js
const productLd = {
  "@context": "https://schema.org", "@type": "Product",
  name: p.name, description: p.description, sku: p.sku, brand: { "@type": "Brand", name: "Agal Boutique" },
  image: p.images.map((i) => i.url), material: p.fabric, category: p.category,
  offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: `${SITE}/product/${p.slug}`, itemCondition: "https://schema.org/NewCondition",
    shippingDetails: { "@type": "OfferShippingDetails", shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" }, deliveryTime: { "@type": "ShippingDeliveryTime", transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" } } },
    hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "IN", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: 7 } },
  ...(p.rating?.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.avg, reviewCount: p.rating.count } } : {}),
};
```

Only include `aggregateRating` when real reviews exist; invented ratings risk a penalty.

**Site-wide** (in the root layout or Home): `Organization` + `WebSite` with `SearchAction` (`/shop?q={search_term_string}`), and `ClothingStore` (a LocalBusiness subtype) if there is a physical shop: name, address, `geo`, `openingHoursSpecification`, `telephone`, `sameAs` (Instagram, Facebook, WhatsApp link). Use the real address; never invent one.

**Other pages**: `BreadcrumbList` on Shop and Product; `ItemList` on Shop listing pages; `FAQPage` on the FAQ block (below) and size-guide/return pages.

## Sitemap and robots

```js
// app/sitemap.js
import { getAllSlugs } from "@/lib/api";
export default async function sitemap() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL;
  const products = await getAllSlugs();
  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({ url: `${SITE}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
  ];
}
```

```js
// app/robots.js
export default function robots() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL;
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/account", "/api"] }], sitemap: `${SITE}/sitemap.xml` };
}
```

Allow the AI crawlers you want citing you (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) by leaving them under `*`, or list them explicitly if the owner wants control.

## llms.txt

Put `public/llms.txt`: a short Markdown summary AI tools can read first.

```
# Agal Boutique
> Women's boutique in Tamil Nadu, India: sarees, kurtis, lehengas, blouses and custom stitching, shipped across India.

## Key pages
- [Shop all](https://www.yourdomain.com/shop): full catalogue with filters
- [Custom stitching](https://www.yourdomain.com/shop/custom-stitching): how measurements and timelines work
- [Shipping and returns](https://www.yourdomain.com/policies/shipping-returns): delivery 3-7 days, 7-day returns
- [Contact](https://www.yourdomain.com/contact): WhatsApp, phone, address
```

Treat it as a harmless bonus; the real work is the on-page content and schema.

## Writing for AI answers (GEO)

- Put the answer first. Each product page opens with a 2-sentence plain summary: what it is, fabric, fit/length, occasion, price.
- Add a short **FAQ** block (3-5 questions) on product, category and policy pages: "How long does custom blouse stitching take?" → "Usually 5-7 days after measurements are confirmed." Mark up with `FAQPage`.
- Use specific, checkable facts (fabric, dimensions, delivery days, return window) in text, not only in images or tables rendered by JS.
- Keep brand name, address, phone and policies identical everywhere (footer, JSON-LD, Google Business Profile).
- Real reviews, real author/owner details on the About page: trust signals AI tools favour.
- Headings phrased like the questions people ask ("Saree blouse sizes: how to measure").

## Local signals (Tamil Nadu / India)

`lang="en-IN"`; optionally `/ta` pages with `hreflang="ta-IN"` and `x-default`; mention serving cities and PIN-code delivery; add the shop to **Google Business Profile** and keep NAP (name, address, phone) consistent; embed a map only on the contact page.

## Performance (affects ranking)

Targets on mobile: LCP < 2.5s, CLS < 0.1, INP < 200ms. Use `next/image` with `sizes` (`(max-width: 768px) 50vw, 25vw` for grids), `priority` on the first hero/product image only, `next/font` (already self-hosted), no autoplay video, lazy-load below-the-fold sections, keep client JS small by leaving most components on the server, and load Razorpay's script only on checkout.

---

# Part E: Design tokens (save as `web/styles/tokens.css` and import in `globals.css`)

```css
/* Agal Boutique design tokens — derived from the logo.
   Tailwind v4: import this file in globals.css, the @theme block exposes tokens as utilities. */

:root {
  /* Brand: plum (logo monogram + crown) */
  --plum-900: #3a1233;
  --plum-700: #6e1f5a;
  --plum-600: #8a2a6f;
  --plum-200: #e6c8dc;
  --plum-100: #f3e3ee;
  --plum-50: #faf1f7;

  /* Action: crimson (logo "B" + dress-form body) */
  --crimson-700: #c20f3d;
  --crimson-600: #e3174b;
  --crimson-100: #fde4eb;

  /* Accents from the swirl: use sparingly, never as button fills */
  --leaf-600: #1e8e4e;
  --leaf-100: #e3f4ea;
  --sky-600: #1f8dc9;

  /* Warm neutrals tinted toward plum */
  --ivory: #fffaf7;
  --blush: #fbeff1;
  --ink: #2b1226;
  --muted: #7a6674;
  --line: rgb(58 18 51 / 0.12);

  /* Shape */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;
  --arch: 999px 999px 20px 20px; /* arch-top frame, echoes the logo curves */

  /* Elevation: flat by default, one soft shadow for sheets */
  --shadow-sheet: 0 -8px 32px rgb(58 18 51 / 0.14);
  --shadow-pop: 0 6px 20px rgb(58 18 51 / 0.12);

  /* Motion */
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 150ms;
  --dur: 220ms;

  /* Type */
  --font-display: var(--font-instrument), "Noto Serif Tamil", Georgia, serif;
  --font-body: var(--font-hanken), "Noto Sans Tamil", system-ui, sans-serif;

  /* Layout */
  --gutter: 16px;
  --container: 1280px;
}

@media (min-width: 768px) {
  :root { --gutter: 24px; }
}

@theme inline {
  --color-plum: var(--plum-600);
  --color-plum-deep: var(--plum-900);
  --color-plum-soft: var(--plum-100);
  --color-crimson: var(--crimson-600);
  --color-crimson-soft: var(--crimson-100);
  --color-leaf: var(--leaf-600);
  --color-ivory: var(--ivory);
  --color-blush: var(--blush);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --font-display: var(--font-display);
  --font-sans: var(--font-body);
}

html { background: var(--ivory); color: var(--ink); font-family: var(--font-body); }
h1, h2, h3 { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.01em; line-height: 1.08; color: var(--plum-900); }

:focus-visible { outline: 2px solid var(--plum-600); outline-offset: 2px; border-radius: 6px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
