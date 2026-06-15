import { Grupo } from '@/types'
import Bandeira from './Bandeira'

// Reordena por pontos → saldo → gols marcados.
// Três níveis: 1º/2º classificados (dourado cheio), 3º em disputa
// (dourado apagado), demais neutros. Linha de corte após o 2º.

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
        const classificado = i < 2 // 1º e 2º: garantidos
        const terceiro = i === 2 // 3º: em disputa (melhores terceiros)
        const linhaDeCorte = i === 2 // corte entre o 2º e o 3º

        const fundo = classificado
          ? 'bg-[var(--copa-gold)]/[0.06]'
          : terceiro
          ? 'bg-[var(--copa-gold)]/[0.025]'
          : ''

        const selo = classificado
          ? 'bg-[var(--copa-gold)] text-[#0A130F]'
          : terceiro
          ? 'border border-[var(--copa-gold)] text-[var(--copa-gold)]'
          : 'text-[var(--mist)]'

        return (
          <div
            key={time.selecao.id}
            className={`relative grid grid-cols-[28px_1fr_32px_40px_40px] items-center gap-2 px-5 py-3 ${fundo} ${
              linhaDeCorte ? 'border-t-2 border-dashed border-[var(--copa-gold)]/30' : 'border-t border-[var(--line)]'
            }`}
          >
            {/* Barra lateral: cheia (classificado) ou apagada (3º) */}
            {classificado && (
              <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-[var(--copa-gold)]" />
            )}
            {terceiro && (
              <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-[var(--copa-gold)]/40" />
            )}

            {/* Posição: selo cheio, contornado ou número simples */}
            <span
              className={`mx-auto grid h-6 w-6 place-items-center rounded-md font-display text-sm font-bold ${selo}`}
            >
              {i + 1}
            </span>

            {/* Seleção */}
            <span className="flex min-w-0 items-center gap-2.5 font-medium text-[var(--chalk)]">
              <Bandeira
                codigo={time.selecao.codigo}
                emoji={time.selecao.bandeira}
                nome={time.selecao.nome}
                tamanho="sm"
              />
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
