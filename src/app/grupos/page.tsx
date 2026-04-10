import TabelaGrupo from '@/components/TabelaGrupo'
import { gruposMock } from '@/lib/dados-mock'
import Link from 'next/link'

export default function GruposPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Topo */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Início
          </Link>
          <h1 className="text-xl font-black text-[var(--copa-gold)] tracking-tight">
            Copa 2026 do Cecone
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Fase de Grupos</h2>

        {/* Grade de grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gruposMock.map((grupo) => (
            <TabelaGrupo key={grupo.nome} grupo={grupo} />
          ))}
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          J = Jogos · V = Vitórias · E = Empates · D = Derrotas · SG = Saldo de Gols · Pts = Pontos
        </p>
      </div>
    </div>
  )
}
