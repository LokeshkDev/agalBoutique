import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Button component with modern corporate branding.
 *
 * @param {"primary" | "action" | "outline" | "ghost" | "secondary"} variant
 * @param {boolean} fullWidth
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {string} [href]
 * @param {any} [as]
 * @param {React.ReactNode} children
 */
export default function Button({
  variant = "primary",
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  href,
  as: Component,
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-sans font-bold text-xs sm:text-sm leading-none cursor-pointer border border-transparent transition-all duration-[var(--dur-fast)] ease-[var(--ease)] active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-plum focus-visible:outline-offset-2 select-none rounded-[5px]";

  const sizes = "min-h-[44px] sm:min-h-[48px] px-5 sm:px-6";

  const variants = {
    primary: "bg-[#8a2a6f] text-white hover:bg-[#6e1f5a] shadow-xs",
    action: "bg-[#e3174b] text-white hover:bg-[#c20f3d] shadow-xs",
    outline: "bg-white text-gray-800 border-gray-300 hover:border-[#8a2a6f] hover:text-[#8a2a6f]",
    secondary: "bg-[#faf5f8] text-[#8a2a6f] border-[#f3e3ee] hover:bg-[#f3e3ee]",
    ghost: "bg-transparent text-gray-800 hover:bg-gray-100",
  };

  const width = fullWidth ? "w-full" : "";
  const combinedClassName = `${base} ${sizes} ${variants[variant] || variants.primary} ${width} ${className}`;

  const content = (
    <>
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
      {variant === "primary" && !loading && (
        <ArrowUpRight size={16} weight="bold" className="shrink-0 ml-1" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName} {...props}>
        {content}
      </Link>
    );
  }

  if (Component && Component !== "button") {
    return (
      <Component className={combinedClassName} {...props}>
        {content}
      </Component>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {content}
    </button>
  );
}
