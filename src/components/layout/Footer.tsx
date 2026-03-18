import { APP_VERSION } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="text-center py-6 relative z-10">
      <p className="text-[10px] uppercase tracking-[2px] text-brew-cream-dim">
        BREWFOCUS v{APP_VERSION}
      </p>
    </footer>
  );
}
