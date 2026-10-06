/**
 * Icon button — translucent circle for wishlist hearts, close buttons, etc.
 * 44px minimum touch target.
 *
 * @param {"default" | "filled"} variant
 * @param {number} size - icon container size in px
 * @param {string} label - accessible label
 * @param {React.ReactNode} children - Phosphor icon
 */
export default function IconButton({
  variant = "default",
  size = 44,
  label,
  className = "",
  children,
  ...props
}) {
  const variants = {
    default: "bg-ivory/80 text-ink hover:bg-ivory",
    filled: "bg-plum text-ivory hover:bg-plum-700",
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-grid place-items-center rounded-full cursor-pointer transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] active:scale-[.95] focus-visible:outline-2 focus-visible:outline-plum focus-visible:outline-offset-2 ${variants[variant] || variants.default} ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      {...props}
    >
      {children}
    </button>
  );
}

