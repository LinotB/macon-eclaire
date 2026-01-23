export default function GoldenGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* glow depuis le bas */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-400/20 blur-[120px] rounded-full" />
      {/* léger voile */}
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#0B1120] to-transparent" />
    </div>
  );
}
