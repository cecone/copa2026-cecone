import { PartidaEliminatoria } from '@/lib/dados-mock'
import Bandeira from './Bandeira'

type Props = { partida: PartidaEliminatoria }

export default function CardEliminatoria({ partida }: Props) {
  const {
    selecao_casa, selecao_fora, gols_casa, gols_fora,
    penaltis_casa, penaltis_fora, status, minuto, hora, data,
  } = partida

  const aoVivo = status === 'ao_vivo'
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
    <div
      className={`overflow-hidden rounded-2xl border bg-[var(--turf)] ${
        aoVivo ? 'border-[var(--copa-red)]' : 'border-[var(--line)]'
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        {aoVivo ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--copa-red)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--copa-red)] animate-pulse motion-reduce:animate-none" />
            {minuto}&apos;
          </span>
        ) : status === 'encerrada' ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mist)]">Encerrado</span>
        ) : aDefinir ? (
          <span className="text-[10px] uppercase tracking-wider text-[var(--mist)]/60">A definir</span>
        ) : (
          <span className="tnum font-display text-xs font-bold uppercase text-[var(--copa-gold)]">
            {formatarData(data)} · {hora}
          </span>
        )}
        {penaltis_casa != null && (
          <span className="text-[10px] uppercase tracking-wide text-[var(--mist)]">Pênaltis</span>
        )}
      </div>

      {/* Times (linhas) */}
      <div className="flex flex-col gap-2 p-4">
        <LinhaTime
          selecao={selecao_casa} aDefinir={aDefinir} venceu={vencedor === 'casa'}
          perdeu={vencedor === 'fora'} gols={gols_casa} penaltis={penaltis_casa ?? null}
        />
        <div className="border-t border-[var(--line)]" />
        <LinhaTime
          selecao={selecao_fora} aDefinir={aDefinir} venceu={vencedor === 'fora'}
          perdeu={vencedor === 'casa'} gols={gols_fora} penaltis={penaltis_fora ?? null}
        />
      </div>
    </div>
  )
}

type LinhaProps = {
  selecao: PartidaEliminatoria['selecao_casa']
  aDefinir: boolean
  venceu: boolean
  perdeu: boolean
  gols: number | null
  penaltis: number | null
}

function LinhaTime({ selecao, aDefinir, venceu, perdeu, gols, penaltis }: LinhaProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${perdeu ? 'opacity-40' : ''}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {aDefinir || !selecao ? (
          <span className="text-2xl">❓</span>
        ) : (
          <Bandeira codigo={selecao.codigo} emoji={selecao.bandeira} nome={selecao.nome} tamanho="md" />
        )}
        <span className={`truncate text-sm font-semibold ${venceu ? 'text-[var(--chalk)]' : 'text-[var(--mist)]'}`}>
          {aDefinir || !selecao ? 'A definir' : selecao.nome}
        </span>
        {venceu && <span className="text-xs text-[var(--copa-gold)]">✓</span>}
      </div>

      <div className="flex items-center gap-2">
        {penaltis != null && <span className="text-xs text-[var(--mist)]">({penaltis})</span>}
        <span
          className={`tnum w-6 text-right font-display text-2xl font-bold ${
            gols !== null ? (venceu ? 'text-[var(--chalk)]' : 'text-[var(--mist)]') : 'text-[var(--line)]'
          }`}
        >
          {gols ?? '–'}
        </span>
      </div>
    </div>
  )
}
