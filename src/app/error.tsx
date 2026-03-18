"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brew-bg">
      <div className="text-center">
        <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-brew-orange mb-4">
          ▪ ERREUR ▪
        </h2>
        <p className="text-brew-gray text-[13px] mb-6">
          {error.message || "Une erreur inattendue est survenue."}
        </p>
        <button
          onClick={reset}
          className="bg-brew-orange text-[#0D0B09] font-bold uppercase tracking-[2px] text-[13px] px-5 py-2 rounded-md cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
