import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="w-16 h-16 bg-[#1B3A6B] rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-xl font-bold">GS</span>
        </div>
        <h1 className="text-[22px] font-bold text-[#1B3A6B] mb-4">À propos de G-Salles EMIT</h1>
        <p className="text-[#6C757D] mb-6">Système de gestion du planning et des salles — EMIT, Université de Fianarantsoa</p>
        <Link href="/" className="text-[#1B3A6B] font-semibold hover:underline">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
