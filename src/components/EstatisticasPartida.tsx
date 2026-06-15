type Stats = {
  posse_casa: number | null; posse_fora: number | null
  chutes_alvo_casa: number | null; chutes_alvo_fora: number | null
  escanteios_casa: number | null; escanteios_fora: number | null
  faltas_casa: number | null; faltas_fora: number | null
  amarelos_casa: number | null; amarelos_fora: number | null
  vermelhos_casa: number | null; vermelhos_fora: number | null
}

export default function EstatisticasPartida({ stats }: { stats: Stats }) {
  const linhas = [
    { label: 'Posse de bola', casa: stats.posse_casa, fora: stats.posse_fora, sufixo: '%' },
    { label: 'Finalizações no alvo', casa: stats.chutes_alvo_casa, fora: stats.chutes_alvo_fora },
    { label: 'Escanteios', casa: stats.escanteios_casa, fora: stats.escanteios_fora },
    { label: 'Faltas', casa: stats.faltas_casa, fora: stats.faltas_fora },
  ]

  const totalCartoes =
    (stats.amarelos_casa ?? 0) + (stats.amarelos_fora ?? 0) +
    (stats.vermelhos_casa ?? 0) + (stats.vermelhos_fora ?? 0)

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--turf)] p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase text-[var(--chalk)]">Estatísticas</h2>
      <div className="flex flex-col gap-4">
        {linhas.map(l => {
          const c = l.casa ?? 0
          const f = l.fora ?? 0
          const total = c + f
          const pctCasa = total > 0 ? (c / total) * 100 : 50
          return (
            <div key={l.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="tnum font-display text-base font-bold text-[var(--chalk)]">{c}{l.sufixo ?? ''}</span>
                <span className="text-[10px] uppercase tracking-wide text-[var(--mist)]">{l.label}</span>
                <span className="tnum font-display text-base font-bold text-[var(--chalk)]">{f}{l.sufixo ?? ''}</span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--turf-2)]">
                <div style={{ width: `${pctCasa}%` }} className="bg-[var(--copa-gold)]" />
                <div style={{ width: `${100 - pctCasa}%` }} className="bg-[var(--copa-blue)]" />
              </div>
            </div>
          )
        })}

        {/* Cartões (mostra só se houver algum) */}
        {totalCartoes > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {Array.from({ length: stats.amarelos_casa ?? 0 }).map((_, i) => <Cartao key={`ya${i}`} cor="#F4C534" />)}
              {Array.from({ length: stats.vermelhos_casa ?? 0 }).map((_, i) => <Cartao key={`ra${i}`} cor="#FF5436" />)}
            </div>
            <span className="text-[10px] uppercase tracking-wide text-[var(--mist)]">Cartões</span>
            <div className="flex gap-1">
              {Array.from({ length: stats.amarelos_fora ?? 0 }).map((_, i) => <Cartao key={`yf${i}`} cor="#F4C534" />)}
              {Array.from({ length: stats.vermelhos_fora ?? 0 }).map((_, i) => <Cartao key={`rf${i}`} cor="#FF5436" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Cartao({ cor }: { cor: string }) {
  return <span style={{ background: cor }} className="inline-block h-3 w-2 rounded-sm" />
}
