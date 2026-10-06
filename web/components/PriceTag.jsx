import { formatPrice, discountPercent } from "@/lib/format";

/**
 * Price display with current price, MRP strikethrough, and discount badge.
 *
 * @param {number} price - selling price
 * @param {number} [mrp] - maximum retail price
 * @param {"sm" | "lg"} size - sm for cards, lg for product detail
 */
export default function PriceTag({ price, mrp, size = "sm" }) {
  const discount = discountPercent(price, mrp);

  const textSize = size === "lg" ? "text-xl" : "text-base";
  const subSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`${textSize} font-semibold font-sans text-ink`}>
        {formatPrice(price)}
      </span>
      {mrp && mrp > price && (
        <>
          <span className={`${subSize} text-muted line-through`}>
            {formatPrice(mrp)}
          </span>
          <span className={`${subSize} font-semibold text-leaf`}>
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
}

