import { Star, Check } from "@phosphor-icons/react/dist/ssr";

/**
 * Chip component — filter chips, size chips, label tags, rating chips.
 *
 * @param {"filter" | "size" | "label" | "rating"} variant
 * @param {boolean} selected
 * @param {boolean} outOfStock - only for size variant
 * @param {React.ReactNode} children
 */
export default function Chip({
  variant = "filter",
  selected = false,
  outOfStock = false,
  className = "",
  children,
  ...props
}) {
  const styles = {
    filter: {
      base: "h-9 px-4 rounded-full border text-sm font-medium transition-colors duration-[var(--dur-fast)]",
      normal: "border-[var(--line)] text-ink bg-transparent hover:bg-plum-50",
      active: "border-transparent bg-plum text-ivory",
    },
    size: {
      base: "h-11 min-w-[44px] px-3 rounded-full border-[1.5px] text-sm font-medium transition-colors duration-[var(--dur-fast)]",
      normal: "border-[var(--line)] text-ink bg-transparent hover:border-plum",
      active: "border-plum bg-plum-50 text-plum-900",
    },
    label: {
      base: "h-6 px-2 rounded-[6px] text-[11px] uppercase tracking-[.08em] font-semibold",
      normal: "bg-blush text-plum",
      active: "bg-blush text-plum",
    },
    rating: {
      base: "h-6 px-2 rounded-[6px] text-xs font-semibold inline-flex items-center gap-1",
      normal: "bg-leaf-soft text-leaf",
      active: "bg-leaf-soft text-leaf",
    },
  };

  const s = styles[variant] || styles.filter;
  const state = selected ? s.active : s.normal;
  const stockStyle = outOfStock
    ? "opacity-50 line-through cursor-not-allowed"
    : "";

  const isButton = variant === "filter" || variant === "size";

  const Tag = isButton ? "button" : "span";

  return (
    <Tag
      type={isButton ? "button" : undefined}
      disabled={outOfStock}
      aria-pressed={isButton ? selected : undefined}
      className={`${s.base} ${state} ${stockStyle} inline-flex items-center justify-center gap-1.5 cursor-pointer ${className}`}
      {...props}
    >
      {variant === "filter" && selected && (
        <Check size={14} weight="bold" />
      )}
      {variant === "rating" && (
        <Star size={12} weight="fill" />
      )}
      {children}
    </Tag>
  );
}

