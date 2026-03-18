"use client";

import { useState } from "react";
import { useBrainDumpStore } from "@/stores/brainDumpStore";

export default function ParkingLot() {
  const parkingItems = useBrainDumpStore((s) => s.parkingItems);
  const [open, setOpen] = useState(false);

  if (parkingItems.length === 0) return null;

  return (
    <div className="mt-3 border-t border-brew-border pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer"
      >
        {open ? "▾" : "▸"} Parking ({parkingItems.length})
      </button>
      {open && (
        <ul className="mt-2 space-y-1">
          {parkingItems.map((item) => (
            <li
              key={item.id}
              className="text-[11px] text-brew-gray pl-3 before:content-['·'] before:mr-2"
            >
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
