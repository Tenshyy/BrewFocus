"use client";

interface StatNumberProps {
  icon: React.ReactNode;
  value: string | number;
  unit: string;
  subtitle: string;
}

export default function StatNumber({
  icon,
  value,
  unit,
  subtitle,
}: StatNumberProps) {
  return (
    <div className="text-center">
      <span className="text-lg">{icon}</span>
      <div className="text-[28px] font-bold text-brew-orange leading-none mt-1">
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[2px] text-brew-cream mt-1">
        {unit}
      </div>
      <div className="text-[9px] text-brew-gray mt-0.5">{subtitle}</div>
    </div>
  );
}
