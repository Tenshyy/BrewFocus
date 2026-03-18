"use client";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}

export default function IconButton({
  icon,
  onClick,
  ariaLabel,
  className = "",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`text-brew-gray hover:text-brew-cream transition-colors duration-200 p-1 cursor-pointer ${className}`}
    >
      {icon}
    </button>
  );
}
