export default function MasonicSymbol() {
  return (
    <svg width="90" height="85" viewBox="0 0 80 75" className="mx-auto drop-shadow-[0_0_20px_rgba(212,175,55,0.45)]">
      {/* Triangle doré */}
      <path d="M40 5 L75 70 L5 70 Z" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
      {/* Œil */}
      <ellipse cx="40" cy="40" rx="18" ry="11" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <circle cx="40" cy="40" r="7" fill="#D4AF37" />
      <circle cx="40" cy="40" r="4" fill="#0B1120" />
      {/* Rayons */}
      <g stroke="#D4AF37" strokeWidth="1.5" opacity="0.8">
        <line x1="40" y1="20" x2="40" y2="12" />
        <line x1="28" y1="27" x2="22" y2="22" />
        <line x1="52" y1="27" x2="58" y2="22" />
        <line x1="22" y1="40" x2="14" y2="40" />
        <line x1="58" y1="40" x2="66" y2="40" />
      </g>
    </svg>
  );
}
