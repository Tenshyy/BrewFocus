"use client";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "font-mono font-bold uppercase tracking-[2px] rounded-md transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brew-orange";

  const sizes = {
    sm: "text-[11px] px-3 py-1.5",
    md: "text-[13px] px-5 py-2",
  };

  const variants = {
    primary:
      "bg-brew-orange text-[#0D0B09] hover:bg-brew-orange-glow disabled:bg-brew-orange-dim disabled:cursor-not-allowed",
    secondary:
      "bg-transparent border border-brew-border text-brew-cream hover:border-brew-gray disabled:opacity-40 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent text-brew-gray hover:text-brew-cream disabled:opacity-40 disabled:cursor-not-allowed",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
