import { Partida } from '@/types'
import Bandeira from './Bandeira'

type Props = { partida: Partida }

export default function CardPartida({ partida }: Props) {
  const { selecao_casa, selecao_fora, gols_casa, gols_fora, status, minuto, hora, fase } = partida

  const aoVivo = status === 'ao_vivo'
  const encerrada = status === 'encerrada'
  const agendada = status === 'agendada'
  const temPlacar = gols_casa !== null && gols_fora !== null

  const vencedor = temPlacar
    ? gols_casa! > gols_fora! ? 'casa' : gols_fora! > gols_casa! ? 'fora' : 'empate'
    : null

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-[var(--turf)] ${
        aoVivo ? 'border-[var(--copa-red)]' : 'border-[var(--line)]'
      }`}
    >
      {/* Cabeçalho: fase + status */}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="font-display text-xs font-semibold uppercase tracking-wider text-[var(--mist)]">
          {fase}
        </span>

        {aoVivo && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--copa-red)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--copa-red)] animate-pulse motion-reduce:animate-none" />
            {minuto}&apos;
          </span>
        )}
        {encerrada && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mist)]">
            Encerrado
          </span>
        )}
        {agendada && (
          <span className="tnum font-display text-sm font-bold text-[var(--copa-gold)]">{hora}</span>
        )}
      </div>

      {/* Placar */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4">
        <TimeCol selecao={selecao_casa} dim={vencedor === 'fora'} />

        <div className="flex min-w-[88px] flex-col items-center">
          {agendada ? (
            <span className="font-display text-2xl font-bold text-[var(--mist)]">VS</span>
          ) : (
            <div className="flex items-baseline gap-2 font-display font-bold tnum">
              <span className={`text-4xl ${vencedor === 'casa' ? 'text-[var(--chalk)]' : 'text-[var(--mist)]'}`}>
                {gols_casa}
              </span>
              <span className="text-xl text-[var(--mist)]">–</span>
              <span className={`text-4xl ${vencedor === 'fora' ? 'text-[var(--chalk)]' : 'text-[var(--mist)]'}`}>
                {gols_fora}
              </span>
            </div>
          )}
          {encerrada && vencedor === 'empate' && (
            <span className="mt-1 text-[10px] uppercase tracking-wide text-[var(--mist)]">Empate</span>
          )}
        </div>

        <TimeCol selecao={selecao_fora} dim={vencedor === 'casa'} />
      </div>
    </div>
  )
}

function TimeCol({ selecao, dim }: { selecao: Partida['selecao_casa']; dim: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${dim ? 'opacity-40' : ''}`}>
      <Bandeira codigo={selecao.codigo} emoji={selecao.bandeira} nome={selecao.nome} tamanho="lg" />
      <span className="text-center text-xs font-semibold leading-tight text-[var(--chalk)]">
        {selecao.nome}
      </span>
    </div>
  )
}
