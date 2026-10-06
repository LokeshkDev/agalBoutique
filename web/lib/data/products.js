export const products = [
  // KURTIS
  {
    id: "kurti-001",
    slug: "floral-cotton-kurti",
    name: "Floral Cotton Kurti",
    category: "Kurtis",
    description: "Knee-length straight fit kurti featuring hand-block floral motifs on breathable cambric cotton. Finished with a classic round neck and 3/4th sleeves suitable for daily and office wear.",
    fabric: "100% Cambric Cotton",
    care: "Machine wash cold, dry in shade",
    occasion: ["Daily Wear", "Casual"],
    price: 799,
    mrp: 1499,
    sizes: [
      { label: "S", stock: 15 }, { label: "M", stock: 10 }, { label: "L", stock: 5 }, { label: "XL", stock: 2 }, { label: "XXL", stock: 0 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Floral cotton kurti front view" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Close up of hand-block print details" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Side view showing straight silhouette" }
    ],
    rating: { avg: 4.5, count: 120 },
    isNew: true,
    isBestseller: true,
    colors: ["Teal", "Maroon"]
  },
  {
    id: "kurti-002",
    slug: "embroidered-rayon-kurti",
    name: "Embroidered Rayon Kurti",
    category: "Kurtis",
    description: "A-line calf-length kurti constructed from 140gm heavy rayon fabric. Features dense thread embroidery along the neckline and hemline.",
    fabric: "Heavy Rayon",
    care: "Dry clean recommended for first wash, then gentle hand wash",
    occasion: ["Festive", "Evening"],
    price: 999,
    mrp: 1899,
    sizes: [
      { label: "S", stock: 4 }, { label: "M", stock: 12 }, { label: "L", stock: 15 }, { label: "XL", stock: 8 }, { label: "XXL", stock: 3 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Embroidered rayon kurti front" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Detailed neckline embroidery" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Back view showing A-line flare" }
    ],
    rating: { avg: 4.2, count: 45 },
    isNew: false,
    isBestseller: false,
    colors: ["Navy Blue", "Mustard"]
  },
  {
    id: "kurti-003",
    slug: "angrakha-style-kurti",
    name: "Angrakha Style Kurti",
    category: "Kurtis",
    description: "Flared floor-length angrakha cut made from soft Chanderi silk. Designed with side tie-ups and gold foil print for festive gatherings.",
    fabric: "Chanderi Silk",
    care: "Dry clean only",
    occasion: ["Festive", "Wedding Guest"],
    price: 1299,
    mrp: 2499,
    sizes: [
      { label: "S", stock: 6 }, { label: "M", stock: 0 }, { label: "L", stock: 7 }, { label: "XL", stock: 4 }, { label: "XXL", stock: 1 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", alt: "Angrakha flared kurti" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Side tie-up detail" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Fabric texture shot" }
    ],
    rating: { avg: 4.8, count: 88 },
    isNew: true,
    isBestseller: true,
    colors: ["Ruby Red", "Emerald Green"]
  },
  {
    id: "kurti-004",
    slug: "straight-fit-office-kurti",
    name: "Straight Fit Office Kurti",
    category: "Kurtis",
    description: "Formal pastel kurti tailored from pure South cotton with a structured Chinese collar and functional side pockets for work essentials.",
    fabric: "Pure Cotton",
    care: "Gentle machine wash",
    occasion: ["Office", "Daily Wear"],
    price: 699,
    mrp: 1299,
    sizes: [
      { label: "S", stock: 20 }, { label: "M", stock: 18 }, { label: "L", stock: 12 }, { label: "XL", stock: 9 }, { label: "XXL", stock: 5 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", alt: "Straight fit office kurti" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Collar detail" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Pocket detail shot" }
    ],
    rating: { avg: 4.1, count: 32 },
    isNew: false,
    isBestseller: false,
    colors: ["Sage Green", "Dusty Pink"]
  },

  // FULL SETS
  {
    id: "set-001",
    slug: "cotton-kurti-palazzo-set",
    name: "Cotton Kurti Palazzo Set",
    category: "Full Sets",
    description: "3-piece coordinated set comprising a straight printed kurti, matching wide-leg flared palazzo, and a 2.2-meter mulmul dupatta.",
    fabric: "100% Cotton",
    care: "Hand wash separately in cold water",
    occasion: ["Daily Wear", "Casual", "Festive"],
    price: 1499,
    mrp: 2999,
    sizes: [
      { label: "S", stock: 10 }, { label: "M", stock: 14 }, { label: "L", stock: 8 }, { label: "XL", stock: 0 }, { label: "XXL", stock: 2 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Full cotton kurti palazzo set" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Dupatta and print detail" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Palazzo border closeup" }
    ],
    rating: { avg: 4.6, count: 215 },
    isNew: true,
    isBestseller: true,
    colors: ["Indigo Blue", "Off White"]
  },
  {
    id: "set-002",
    slug: "printed-anarkali-set",
    name: "Printed Anarkali Set",
    category: "Full Sets",
    description: "24-kali flared anarkali suit set paired with churidar and a gotta-patti bordered organza dupatta. Stitched with comfortable cotton lining.",
    fabric: "Cotton Silk",
    care: "Dry clean only",
    occasion: ["Festive", "Family Gathering"],
    price: 1899,
    mrp: 3499,
    sizes: [
      { label: "S", stock: 5 }, { label: "M", stock: 7 }, { label: "L", stock: 4 }, { label: "XL", stock: 1 }, { label: "XXL", stock: 0 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Printed anarkali suit full flare" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Gotta patti border on dupatta" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Bodice detail" }
    ],
    rating: { avg: 4.7, count: 64 },
    isNew: true,
    isBestseller: false,
    colors: ["Mustard Yellow", "Rust Orange"]
  },
  {
    id: "set-003",
    slug: "festive-silk-set",
    name: "Festive Silk Set",
    category: "Full Sets",
    description: "Rich raw silk kurta and cigarette pant suit accompanied by a woven banarasi art silk dupatta with traditional zari motifs.",
    fabric: "Raw Silk Blend",
    care: "Dry clean only",
    occasion: ["Festive", "Wedding Guest"],
    price: 2999,
    mrp: 5999,
    sizes: [
      { label: "S", stock: 3 }, { label: "M", stock: 5 }, { label: "L", stock: 6 }, { label: "XL", stock: 2 }, { label: "XXL", stock: 1 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Festive raw silk suit set" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Banarasi dupatta zari weave" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Pant ankle slit detail" }
    ],
    rating: { avg: 4.4, count: 28 },
    isNew: false,
    isBestseller: true,
    colors: ["Wine Plum", "Teal"]
  },
  {
    id: "set-004",
    slug: "casual-co-ord-set",
    name: "Casual Co-ord Set",
    category: "Full Sets",
    description: "Western-fusion matching tunic shirt and cropped tapered trousers crafted from textured linen-cotton with mother-of-pearl buttons.",
    fabric: "Linen Cotton",
    care: "Gentle machine wash",
    occasion: ["Casual", "Office", "Travel"],
    price: 1199,
    mrp: 2299,
    sizes: [
      { label: "S", stock: 8 }, { label: "M", stock: 11 }, { label: "L", stock: 9 }, { label: "XL", stock: 6 }, { label: "XXL", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", alt: "Linen co-ord set full look" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Texture detail of linen" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Trousers waistband elastic detail" }
    ],
    rating: { avg: 3.9, count: 19 },
    isNew: false,
    isBestseller: false,
    colors: ["Beige", "Olive Green"]
  },

  // SAREES
  {
    id: "saree-001",
    slug: "kanchipuram-silk-saree",
    name: "Kanchipuram Silk Saree",
    category: "Sarees",
    description: "Handwoven pure art silk Kanchipuram drape featuring an ornate gold zari temple border and heavy contrast pallu. Includes unstitched matching blouse piece.",
    fabric: "Art Silk",
    care: "Dry clean only, store in cotton cover",
    occasion: ["Bridal", "Festive", "Temple"],
    price: 4999,
    mrp: 8999,
    sizes: [
      { label: "Free Size", stock: 8 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Kanchipuram silk saree full drape" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Zari temple border closeup" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Rich pallu detail" }
    ],
    rating: { avg: 4.8, count: 156 },
    isNew: true,
    isBestseller: true,
    colors: ["Crimson Red", "Royal Blue"]
  },
  {
    id: "saree-002",
    slug: "cotton-handloom-saree",
    name: "Cotton Handloom Saree",
    category: "Sarees",
    description: "Soft 80-count Chettinad style cotton handloom saree with woven thread borders. Breathable weave created by artisans in Tamil Nadu.",
    fabric: "100% Handloom Cotton",
    care: "Hand wash with mild detergent, starch lightly",
    occasion: ["Daily Wear", "Office", "Casual"],
    price: 1299,
    mrp: 2499,
    sizes: [
      { label: "Free Size", stock: 14 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469668-935a823e20e8?w=800&q=80", alt: "Cotton handloom saree drape" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Chettinad border detail" },
      { url: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", alt: "Pallu stripes detail" }
    ],
    rating: { avg: 4.3, count: 72 },
    isNew: false,
    isBestseller: true,
    colors: ["Earthy Mustard", "Maroon"]
  },
  {
    id: "saree-003",
    slug: "georgette-party-saree",
    name: "Georgette Party Saree",
    category: "Sarees",
    description: "Lightweight 60gm georgette saree embellished with delicate sequin cut-work border along all edges. Easy to pleat and drape.",
    fabric: "Poly Georgette",
    care: "Dry clean only",
    occasion: ["Party", "Evening"],
    price: 1999,
    mrp: 3999,
    sizes: [
      { label: "Free Size", stock: 6 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Georgette party saree drape" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Sequin border closeup" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Pleat fall detail" }
    ],
    rating: { avg: 4.0, count: 39 },
    isNew: true,
    isBestseller: false,
    colors: ["Lavender", "Black"]
  },
  {
    id: "saree-004",
    slug: "linen-daily-saree",
    name: "Linen Daily Saree",
    category: "Sarees",
    description: "Organic linen saree with subtle metallic zari pinstripes and tassel detailing on the pallu. Crisp finish with effortless drape.",
    fabric: "Organic Linen Blend",
    care: "Gentle hand wash",
    occasion: ["Office", "Daily Wear"],
    price: 899,
    mrp: 1699,
    sizes: [
      { label: "Free Size", stock: 11 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", alt: "Linen daily saree look" },
      { url: "https://images.unsplash.com/photo-1610030469668-935a823e20e8?w=800&q=80", alt: "Zari pinstripe closeup" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Tassels on pallu" }
    ],
    rating: { avg: 4.4, count: 53 },
    isNew: false,
    isBestseller: false,
    colors: ["Sky Blue", "Pastel Peach"]
  },

  // BLOUSES
  {
    id: "blouse-001",
    slug: "readymade-silk-blouse",
    name: "Readymade Silk Blouse",
    category: "Blouses",
    description: "Padded princess-cut readymade blouse in brocade silk. Tailored with back hooks, dori tie-ups, and 2-inch margin inside for easy alteration.",
    fabric: "Brocade Art Silk",
    care: "Dry clean only",
    occasion: ["Festive", "Wedding Guest"],
    price: 599,
    mrp: 1199,
    sizes: [
      { label: "34", stock: 6 }, { label: "36", stock: 12 }, { label: "38", stock: 8 }, { label: "40", stock: 4 }, { label: "42", stock: 0 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Brocade silk readymade blouse" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Back dori tie-up detail" },
      { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", alt: "Inside margin stitch detail" }
    ],
    rating: { avg: 4.6, count: 180 },
    isNew: false,
    isBestseller: true,
    colors: ["Golden", "Crimson"]
  },
  {
    id: "blouse-002",
    slug: "custom-stitching-blouse",
    name: "Custom Stitching Blouse",
    category: "Blouses",
    description: "Bespoke tailoring service tailored to your exact measurements. Choose your neckline, sleeve length, and piping options. Ready in 3–5 working days.",
    fabric: "Raw Silk / Cotton Silk",
    care: "Dry clean only",
    occasion: ["Bridal", "Festive", "Custom"],
    price: 799,
    mrp: 1499,
    sizes: [
      { label: "Custom Fit", stock: 99 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", alt: "Tailored custom stitched blouse" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Neckline piping workmanship" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Sleeve embroidery custom finish" }
    ],
    rating: { avg: 4.9, count: 310 },
    isNew: true,
    isBestseller: true,
    colors: ["Plum", "Deep Maroon", "Bottle Green"]
  },
  {
    id: "blouse-003",
    slug: "embroidered-designer-blouse",
    name: "Embroidered Designer Blouse",
    category: "Blouses",
    description: "Heavy Aari and zardozi hand-embroidery on the sleeves and back neck of pure velvet-silk fabric. Padded cups included.",
    fabric: "Velvet Silk",
    care: "Dry clean only",
    occasion: ["Bridal", "Reception"],
    price: 999,
    mrp: 1899,
    sizes: [
      { label: "34", stock: 3 }, { label: "36", stock: 5 }, { label: "38", stock: 2 }, { label: "40", stock: 0 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Hand-embroidered Aari blouse" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Zardozi sleeve detail" },
      { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", alt: "Back neck embroidery" }
    ],
    rating: { avg: 4.7, count: 42 },
    isNew: true,
    isBestseller: false,
    colors: ["Peacock Blue", "Plum Purple"]
  },
  {
    id: "blouse-004",
    slug: "padded-cotton-blouse",
    name: "Padded Cotton Blouse",
    category: "Blouses",
    description: "Everyday hand-block printed cotton blouse with comfortable breathable foam padding and wooden buttons on the front placket.",
    fabric: "100% Kalamkari Cotton",
    care: "Hand wash in cold water",
    occasion: ["Daily Wear", "Casual"],
    price: 499,
    mrp: 899,
    sizes: [
      { label: "34", stock: 10 }, { label: "36", stock: 14 }, { label: "38", stock: 16 }, { label: "40", stock: 8 }, { label: "42", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Kalamkari cotton daily blouse" },
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Wooden buttons detail" },
      { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", alt: "Block print texture" }
    ],
    rating: { avg: 4.2, count: 95 },
    isNew: false,
    isBestseller: false,
    colors: ["Earthy Brown", "Indigo"]
  },

  // LEHENGAS
  {
    id: "lehenga-001",
    slug: "bridal-lehenga-set",
    name: "Bridal Lehenga Set",
    category: "Lehengas",
    description: "Semi-stitched 4-meter flared lehenga in heavy silk with intricate zardozi, zari, and pearl work. Includes heavy unstitched blouse and dual dupattas.",
    fabric: "Raw Silk & Net",
    care: "Specialist dry clean only",
    occasion: ["Bridal", "Wedding"],
    price: 8999,
    mrp: 15999,
    sizes: [
      { label: "Semi-Stitched", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Bridal heavy silk lehenga set" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Zari and pearl embroidery detail" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Can-can layered skirt flare" }
    ],
    rating: { avg: 4.9, count: 68 },
    isNew: true,
    isBestseller: true,
    colors: ["Deep Crimson", "Plum Red"]
  },
  {
    id: "lehenga-002",
    slug: "party-wear-lehenga",
    name: "Party Wear Lehenga",
    category: "Lehengas",
    description: "Modern georgette lehenga featuring mirror-work motifs and chevron printed flare. Comes with a ready-padded sleeveless blouse.",
    fabric: "Georgette",
    care: "Dry clean only",
    occasion: ["Party", "Sangeet", "Cocktail"],
    price: 3999,
    mrp: 6999,
    sizes: [
      { label: "S", stock: 4 }, { label: "M", stock: 6 }, { label: "L", stock: 3 }, { label: "XL", stock: 0 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", alt: "Party wear mirror work lehenga" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Mirror work belt detail" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Blouse neckline detail" }
    ],
    rating: { avg: 4.5, count: 52 },
    isNew: false,
    isBestseller: false,
    colors: ["Blush Pink", "Mint Green"]
  },
  {
    id: "lehenga-003",
    slug: "cotton-lehenga-choli",
    name: "Cotton Lehenga Choli",
    category: "Lehengas",
    description: "Gujarati style Kutchi embroidered pure cotton lehenga with real mirror borders, paired with a matching tie-back choli and bandhani dupatta.",
    fabric: "100% Cotton",
    care: "Dry clean for first wash, then gentle hand wash",
    occasion: ["Navratri", "Festive", "Casual"],
    price: 1999,
    mrp: 3499,
    sizes: [
      { label: "Free Size", stock: 12 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Cotton lehenga choli look" },
      { url: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", alt: "Kutchi embroidery closeup" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Bandhani dupatta border" }
    ],
    rating: { avg: 4.3, count: 37 },
    isNew: false,
    isBestseller: false,
    colors: ["Multicolor Black", "Bright Yellow"]
  },
  {
    id: "lehenga-004",
    slug: "half-saree-set",
    name: "Half Saree Set (Dhavani)",
    category: "Lehengas",
    description: "Traditional South Indian Langa Voni half-saree set in Kanchipuram art silk with rich temple zari borders and a sheer organza dhavani.",
    fabric: "Art Silk & Organza",
    care: "Dry clean only",
    occasion: ["Festive", "Family Function", "Temple"],
    price: 2499,
    mrp: 4499,
    sizes: [
      { label: "Free Size", stock: 7 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "South Indian traditional half saree" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", alt: "Zari border on skirt" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Organza dhavani pleats" }
    ],
    rating: { avg: 4.8, count: 104 },
    isNew: true,
    isBestseller: true,
    colors: ["Bottle Green & Pink", "Purple & Gold"]
  },

  // KIDSWEAR
  {
    id: "kids-001",
    slug: "girls-pattu-pavadai",
    name: "Girls Pattu Pavadai",
    category: "Kidswear",
    description: "Traditional South Indian jacquard silk skirt and blouse set for girls, lined with 100% soft cotton for sensitive skin comfort.",
    fabric: "Jacquard Art Silk & Cotton Lining",
    care: "Hand wash gently in cold water",
    occasion: ["Festive", "Temple", "Birthday"],
    price: 1499,
    mrp: 2999,
    sizes: [
      { label: "2-3Y", stock: 6 }, { label: "4-5Y", stock: 10 }, { label: "6-7Y", stock: 8 }, { label: "8-9Y", stock: 5 }, { label: "10-12Y", stock: 0 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", alt: "Traditional kids pattu pavadai" },
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Skirt zari border" },
      { url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80", alt: "Top neckline stitch" }
    ],
    rating: { avg: 4.7, count: 91 },
    isNew: true,
    isBestseller: true,
    colors: ["Yellow & Magenta", "Green & Orange"]
  },
  {
    id: "kids-002",
    slug: "kids-kurti-set",
    name: "Kids Kurti Palazzo Set",
    category: "Kidswear",
    description: "Breathable soft cotton printed kurti and elasticated palazzo set for daily comfort and festive charm.",
    fabric: "100% Cotton",
    care: "Machine wash cold",
    occasion: ["Casual", "Daily Wear"],
    price: 699,
    mrp: 1299,
    sizes: [
      { label: "2-3Y", stock: 12 }, { label: "4-5Y", stock: 15 }, { label: "6-7Y", stock: 10 }, { label: "8-9Y", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80", alt: "Kids cotton kurti palazzo set" },
      { url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", alt: "Floral print detail" },
      { url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80", alt: "Elastic waistband view" }
    ],
    rating: { avg: 4.4, count: 48 },
    isNew: false,
    isBestseller: false,
    colors: ["Sky Blue", "Coral"]
  },
  {
    id: "kids-003",
    slug: "girls-salwar-set",
    name: "Girls Salwar Suit Set",
    category: "Kidswear",
    description: "Ready-to-wear chanderi cotton frock suit with churidar and a net dupatta decorated with lace borders.",
    fabric: "Chanderi Cotton",
    care: "Hand wash separately",
    occasion: ["Festive", "Family Gathering"],
    price: 899,
    mrp: 1699,
    sizes: [
      { label: "4-5Y", stock: 7 }, { label: "6-7Y", stock: 9 }, { label: "8-9Y", stock: 6 }, { label: "10-12Y", stock: 3 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80", alt: "Girls salwar suit set" },
      { url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80", alt: "Lace border on dupatta" },
      { url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", alt: "Yoke embroidery" }
    ],
    rating: { avg: 4.2, count: 24 },
    isNew: false,
    isBestseller: false,
    colors: ["Lavender", "Peach"]
  },
  {
    id: "kids-004",
    slug: "kids-party-frock",
    name: "Kids Festive Frock",
    category: "Kidswear",
    description: "Layered tulle and satin party frock with soft cotton lining, pearl waistbelt, and a back bow tie for birthdays and weddings.",
    fabric: "Tulle & Satin with Cotton Lining",
    care: "Dry clean recommended",
    occasion: ["Party", "Birthday", "Festive"],
    price: 999,
    mrp: 1899,
    sizes: [
      { label: "2-3Y", stock: 5 }, { label: "4-5Y", stock: 8 }, { label: "6-7Y", stock: 7 }, { label: "8-9Y", stock: 2 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", alt: "Kids festive party frock" },
      { url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80", alt: "Pearl belt and bow detail" },
      { url: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80", alt: "Layered tulle skirt" }
    ],
    rating: { avg: 4.6, count: 62 },
    isNew: true,
    isBestseller: true,
    colors: ["Pastel Pink", "Wine Red"]
  }
];

export const getFeaturedProducts = () => products.filter((p) => p.isBestseller).slice(0, 8);
export const getNewArrivals = () => products.filter((p) => p.isNew).slice(0, 8);
