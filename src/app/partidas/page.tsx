import CardPartida from '@/components/CardPartida'
import { partidasMock } from '@/lib/dados-mock'
import { Partida } from '@/types'
import Link from 'next/link'

function formatarData(dataStr: string) {
  const data = new Date(dataStr + 'T12:00:00')
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function PartidasPage() {
  // Agrupar por data
  const porData = partidasMock.reduce<Record<string, Partida[]>>((acc, partida) => {
    if (!acc[partida.data]) acc[partida.data] = []
    acc[partida.data].push(partida)
    return acc
  }, {})

  const datas = Object.keys(porData).sort()

  // Separar ao vivo
  const aoVivo = partidasMock.filter(p => p.status === 'ao_vivo')

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Início
          </Link>
          <h1 className="text-xl font-black text-[var(--copa-gold)] tracking-tight">
            Copa 2026 do Cecone
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Partidas</h2>

        {/* Ao vivo */}
        {aoVivo.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--copa-red)] animate-pulse"></span>
              <span className="text-sm font-bold text-[var(--copa-red)] uppercase tracking-wider">Ao vivo agora</span>
            </div>
            <div className="flex flex-col gap-3">
              {aoVivo.map(p => <CardPartida key={p.id} partida={p} />)}
            </div>
          </div>
        )}

        {/* Por data */}
        {datas.map(data => (
          <div key={data} className="mb-8">
            <h3 className="text-sm text-white/40 font-semibold uppercase tracking-wider mb-3 capitalize">
              {formatarData(data)}
            </h3>
            <div className="flex flex-col gap-3">
              {porData[data].map(p => (
                <CardPartida key={p.id} partida={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
