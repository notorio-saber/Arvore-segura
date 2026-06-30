const baseClasses = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-forest text-white hover:bg-forest-dark shadow-sm",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
  ghost: "bg-transparent text-forest hover:bg-forest-light",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  return (
    <button className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}
