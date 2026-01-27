// src/components/ui/DifficultyStones.jsx
export default function DifficultyStones({ points = 1, src, className = "" }) {
  const n = Math.max(1, Math.min(3, Number(points) || 1));
  const label = n === 1 ? "FACILE" : n === 2 ? "INTERMÉDIAIRE" : "DIFFICILE";

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* 3 slots fixes -> rendu stable */}
      <div className="inline-flex items-center gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => {
          const active = i < n;
          return (
            <div
              key={i}
              className={[
                "relative w-6 h-6",
                active ? "opacity-100" : "opacity-25",
              ].join(" ")}
            >
              {active && (
                <div className="absolute inset-0 rounded-full blur-md bg-[#D4AF37]/25" />
              )}
              <img
                src={src}
                alt=""
                className="relative w-6 h-6 object-contain select-none"
                draggable="false"
              />
            </div>
          );
        })}
      </div>

      {/* badge texte (desktop) */}
      <span className="hidden md:inline-flex px-2.5 py-1 rounded-full text-[10px] font-display tracking-[0.16em] border border-white/15 bg-black/20 text-white/70">
        {label}
      </span>
    </div>
  );
}
