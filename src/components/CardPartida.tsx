import { Partida } from '@/types'

type Props = {
  partida: Partida
}

export default function CardPartida({ partida }: Props) {
  const { selecao_casa, selecao_fora, gols_casa, gols_fora, status, minuto, hora, fase } = partida

  const vencedor =
    gols_casa !== null && gols_fora !== null
      ? gols_casa > gols_fora ? 'casa' : gols_fora > gols_casa ? 'fora' : 'empate'
      : null

  return (
    <div className={`bg-[var(--surface)] rounded-xl p-4 border ${status === 'ao_vivo' ? 'border-[var(--copa-red)]' : 'border-white/10'}`}>
      {/* Fase + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{fase}</span>
        {status === 'ao_vivo' && (
          <span className="flex items-center gap-1 text-[var(--copa-red)] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--copa-red)] animate-pulse"></span>
            {minuto}&apos;
          </span>
        )}
        {status === 'encerrada' && (
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Encerrado</span>
        )}
        {status === 'agendada' && (
          <span className="text-[10px] text-[var(--copa-gold)] font-semibold">{hora}</span>
        )}
      </div>

      {/* Times e placar */}
      <div className="flex items-center justify-between gap-2">
        {/* Time da casa */}
        <div className={`flex flex-col items-center gap-1 flex-1 ${vencedor === 'fora' ? 'opacity-40' : ''}`}>
          <span className="text-3xl">{selecao_casa.bandeira}</span>
          <span className="text-xs font-semibold text-center text-white/80 leading-tight">{selecao_casa.nome}</span>
        </div>

        {/* Placar / Horário */}
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          {status === 'agendada' ? (
            <span className="text-white/30 text-lg font-bold tracking-widest">vs</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black tabular-nums ${vencedor === 'casa' ? 'text-white' : 'text-white/50'}`}>
                {gols_casa}
              </span>
              <span className="text-white/30 text-xl font-light">–</span>
              <span className={`text-3xl font-black tabular-nums ${vencedor === 'fora' ? 'text-white' : 'text-white/50'}`}>
                {gols_fora}
              </span>
            </div>
          )}
          {status === 'encerrada' && vencedor === 'empate' && (
            <span className="text-[10px] text-white/30">Empate</span>
          )}
        </div>

        {/* Time de fora */}
        <div className={`flex flex-col items-center gap-1 flex-1 ${vencedor === 'casa' ? 'opacity-40' : ''}`}>
          <span className="text-3xl">{selecao_fora.bandeira}</span>
          <span className="text-xs font-semibold text-center text-white/80 leading-tight">{selecao_fora.nome}</span>
        </div>
      </div>
    </div>
  )
}
