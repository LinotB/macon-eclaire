import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StarField from "../components/ui/StarField";

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      <header className="relative z-10 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>
          <div className="font-display tracking-[0.18em] text-sm">
            Paramètres
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="font-display tracking-[0.12em] text-xl text-white/90">
            Page Paramètres en cours
          </div>
          <div className="mt-3 font-body text-white/55">
            On la fera après le Bilan et le Profil.
          </div>
        </div>
      </main>
    </div>
  );
}
