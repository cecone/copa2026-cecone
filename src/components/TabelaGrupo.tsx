import { Grupo } from '@/types'

export default function TabelaGrupo({ grupo }: { grupo: Grupo }) {
  const times = [...grupo.times].sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos
    if (b.saldo !== a.saldo) return b.saldo - a.saldo
    return b.gols_marcados - a.gols_marcados
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--turf)]">
      {/* Faixa do grupo */}
      <div className="flex items-center gap-2.5 border-b border-[var(--line)] px-5 py-3.5">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--turf-2)] font-display text-base font-bold text-[var(--chalk)]">
          {grupo.nome}
        </span>
        <span className="font-display text-lg font-semibold uppercase text-[var(--chalk)]">
          Grupo {grupo.nome}
        </span>
      </div>

      {/* Cabeçalho de colunas */}
      <div className="grid grid-cols-[28px_1fr_32px_40px_40px] gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--mist)]">
        <span className="text-center">#</span>
        <span>Seleção</span>
        <span className="text-center">J</span>
        <span className="text-center">SG</span>
        <span className="text-center">Pts</span>
      </div>

      {/* Linhas */}
      {times.map((time, i) => {
        const classificado = i < 2
        return (
          <div
            key={time.selecao.id}
            className="grid grid-cols-[28px_1fr_32px_40px_40px] items-center gap-2 border-t border-[var(--line)] px-5 py-3"
          >
            <span
              className={`text-center font-display text-base font-bold ${
                classificado ? 'text-[var(--copa-gold)]' : 'text-[var(--mist)]'
              }`}
            >
              {i + 1}
            </span>

            <span className="flex items-center gap-2.5 font-medium text-[var(--chalk)]">
              <span className="text-lg leading-none">{time.selecao.bandeira}</span>
              <span className="truncate">{time.selecao.nome}</span>
            </span>

            <span className="tnum text-center text-sm text-[var(--mist)]">{time.jogos}</span>
            <span className="tnum text-center text-sm text-[var(--mist)]">
              {time.saldo > 0 ? '+' : ''}
              {time.saldo}
            </span>
            <span className="tnum text-center font-display text-lg font-bold text-[var(--chalk)]">
              {time.pontos}
            </span>
          </div>
        )
      })}
    </div>
  )
}
