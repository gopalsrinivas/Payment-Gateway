const variants = {
  primary: "bg-brand text-white hover:bg-teal-800",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const Button = ({ as: Component = "button", variant = "primary", className = "", disabled, children, ...props }) => (
  <Component
    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </Component>
);

export default Button;
