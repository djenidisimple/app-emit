import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1B3A6B] flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-[#1B3A6B] text-[28px] font-bold">GS</span>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">G-Salles EMIT</h1>
        <p className="text-white/70 mb-8">Système de gestion du planning et des salles</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-white text-[#1B3A6B] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#E8EEF8] transition-colors duration-150"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-white/10 transition-colors duration-150"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
