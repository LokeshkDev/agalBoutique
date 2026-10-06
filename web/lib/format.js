/**
 * Format a number as Indian Rupee price
 * @param {number} n
 * @returns {string} e.g. "₹1,499"
 */
export function formatPrice(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Calculate discount percentage
 * @param {number} price - selling price
 * @param {number} mrp - maximum retail price
 * @returns {number} e.g. 47
 */
export function discountPercent(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Generate a WhatsApp click-to-chat URL
 * @param {string} message
 * @returns {string}
 */
export function whatsappUrl(message = "") {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP || "919876543210";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Map Indian fashion color names to hex codes for UI swatches
 * @param {string} colorName
 * @returns {string} hex code
 */
export function getColorHex(colorName) {
  if (!colorName) return "#6e1f5a";
  const name = colorName.toLowerCase().trim();

  const map = {
    teal: "#008080",
    maroon: "#800000",
    "navy blue": "#001f3f",
    navy: "#001f3f",
    mustard: "#d4a017",
    "mustard yellow": "#d4a017",
    "ruby red": "#c2185b",
    "emerald green": "#00897b",
    emerald: "#00897b",
    "sage green": "#8a9a86",
    "dusty pink": "#dcae96",
    "indigo blue": "#1a237e",
    indigo: "#1a237e",
    "off white": "#f5f5f0",
    "rust orange": "#c65102",
    rust: "#c65102",
    "wine plum": "#581845",
    wine: "#581845",
    "wine red": "#880e4f",
    beige: "#d8bc9d",
    "olive green": "#556b2f",
    "crimson red": "#c2185b",
    crimson: "#c2185b",
    "deep crimson": "#990000",
    "royal blue": "#1565c0",
    "earthy mustard": "#c8963e",
    lavender: "#9575cd",
    black: "#212121",
    "multicolor black": "#212121",
    "sky blue": "#4fc3f7",
    "pastel peach": "#ffab91",
    peach: "#ffab91",
    golden: "#d4af37",
    gold: "#d4af37",
    "deep maroon": "#5d101d",
    "bottle green": "#1b4d3e",
    "peacock blue": "#005f73",
    "plum purple": "#6e1f5a",
    plum: "#6e1f5a",
    "plum red": "#781d42",
    "earthy brown": "#6d4c41",
    "blush pink": "#f48fb1",
    "pastel pink": "#f48fb1",
    pink: "#e91e63",
    "mint green": "#80cbc4",
    "bright yellow": "#fbc02d",
    yellow: "#fbc02d",
    coral: "#ff7043",
    green: "#2e7d32",
    red: "#d32f2f",
    blue: "#1976d2",
    purple: "#7b1fa2",
    orange: "#f57c00",
    white: "#ffffff",
  };

  if (map[name]) return map[name];

  // Try partial match or compound "&" colors
  for (const [key, hex] of Object.entries(map)) {
    if (name.includes(key)) return hex;
  }

  return "#6e1f5a";
}

