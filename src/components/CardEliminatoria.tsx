import { PartidaEliminatoria } from '@/lib/dados-mock'
import Bandeira from './Bandeira'

type Props = {
  partida: PartidaEliminatoria
}

export default function CardEliminatoria({ partida }: Props) {
  const { selecao_casa, selecao_fora, gols_casa, gols_fora, penaltis_casa, penaltis_fora, status, minuto, hora, data } = partida

  const aDefinir = status === 'a_definir'

  const vencedor =
    gols_casa !== null && gols_fora !== null
      ? penaltis_casa != null && penaltis_fora != null
        ? penaltis_casa > penaltis_fora! ? 'casa' : 'fora'
        : gols_casa > gols_fora ? 'casa' : gols_fora > gols_casa ? 'fora' : 'empate'
      : null

  function formatarData(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className={`bg-[var(--surface)] rounded-xl border overflow-hidden ${
      status === 'ao_vivo' ? 'border-[var(--copa-red)]' : 'border-white/10'
    }`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        {status === 'ao_vivo' ? (
          <span className="flex items-center gap-1 text-[var(--copa-red)] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--copa-red)] animate-pulse"></span>
            {minuto}&apos;
          </span>
        ) : status === 'encerrada' ? (
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Encerrado</span>
        ) : aDefinir ? (
          <span className="text-[10px] text-white/20 uppercase tracking-wider">A definir</span>
        ) : (
          <span className="text-[10px] text-[var(--copa-gold)] font-semibold">{formatarData(data)} · {hora}</span>
        )}
        {penaltis_casa != null && (
          <span className="text-[10px] text-white/40">Pênaltis</span>
        )}
      </div>

      {/* Times */}
      <div className="p-4 flex flex-col gap-2">
        {/* Casa */}
        <div className="flex items-center justify-between gap-3">
          <div className={`flex items-center gap-3 flex-1 min-w-0 ${vencedor === 'fora' ? 'opacity-40' : ''}`}>
            {aDefinir || !selecao_casa
              ? <span className="text-2xl">❓</span>
              : <Bandeira codigo={selecao_casa.codigo} emoji={selecao_casa.bandeira} nome={selecao_casa.nome} tamanho="md" />
            }
            <span className={`text-sm font-semibold truncate ${vencedor === 'casa' ? 'text-white' : 'text-white/70'}`}>
              {aDefinir || !selecao_casa ? 'A definir' : selecao_casa.nome}
            </span>
            {vencedor === 'casa' && <span className="text-[var(--copa-gold)] text-xs">✓</span>}
          </div>
          <div className="flex items-center gap-2 text-right">
            {penaltis_casa != null && (
              <span className="text-white/30 text-xs">({penaltis_casa})</span>
            )}
            <span className={`text-xl font-black w-5 text-right tabular-nums ${
              gols_casa !== null ? (vencedor === 'casa' ? 'text-white' : 'text-white/40') : 'text-white/10'
            }`}>
              {gols_casa ?? '–'}
            </span>
          </div>
        </div>

        <div className="border-t border-white/5"></div>

        {/* Fora */}
        <div className="flex items-center justify-between gap-3">
          <div className={`flex items-center gap-3 flex-1 min-w-0 ${vencedor === 'casa' ? 'opacity-40' : ''}`}>
            {aDefinir || !selecao_fora
              ? <span className="text-2xl">❓</span>
              : <Bandeira codigo={selecao_fora.codigo} emoji={selecao_fora.bandeira} nome={selecao_fora.nome} tamanho="md" />
            }
            <span className={`text-sm font-semibold truncate ${vencedor === 'fora' ? 'text-white' : 'text-white/70'}`}>
              {aDefinir || !selecao_fora ? 'A definir' : selecao_fora.nome}
            </span>
            {vencedor === 'fora' && <span className="text-[var(--copa-gold)] text-xs">✓</span>}
          </div>
          <div className="flex items-center gap-2 text-right">
            {penaltis_fora != null && (
              <span className="text-white/30 text-xs">({penaltis_fora})</span>
            )}
            <span className={`text-xl font-black w-5 text-right tabular-nums ${
              gols_fora !== null ? (vencedor === 'fora' ? 'text-white' : 'text-white/40') : 'text-white/10'
            }`}>
              {gols_fora ?? '–'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
