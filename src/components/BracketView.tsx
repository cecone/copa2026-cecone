'use client'

import { PartidaEliminatoria } from '@/lib/dados-mock'
import Bandeira from './Bandeira'

// ── Layout ─────────────────────────────────────────────────────
const CARD_H = 58          // altura do mini-card (px)
const CARD_W = 164         // largura do mini-card (px)
const GAP    = 8           // gap vertical entre cards consecutivos da R32
const UNIT   = CARD_H + GAP  // 66 px por slot da R32

const COL_SPACE = 40       // espaço horizontal entre colunas (linhas conectoras)
const COL_W     = CARD_W + COL_SPACE  // 204 px por coluna

const ROUND_COUNTS = [16, 8, 4, 2, 1]  // cards por fase: rodada32 → final

// Posição vertical do card r, i
function cardTop(r: number, i: number): number {
  if (r === 0) return i * UNIT
  const a = cardTop(r - 1, i * 2)
  const b = cardTop(r - 1, i * 2 + 1)
  return Math.round((a + b + CARD_H) / 2 - CARD_H / 2)
}

const TOTAL_H = (ROUND_COUNTS[0] - 1) * UNIT + CARD_H   // 15*66+58 = 1048
const TOTAL_W = ROUND_COUNTS.length * COL_W - COL_SPACE  // 5*204-40 = 980

// SVG: linhas conectoras de todas as fases
function buildPaths(): string {
  const d: string[] = []
  for (let r = 1; r < ROUND_COUNTS.length; r++) {
    for (let i = 0; i < ROUND_COUNTS[r]; i++) {
      const topY  = cardTop(r - 1, i * 2    ) + CARD_H / 2
      const botY  = cardTop(r - 1, i * 2 + 1) + CARD_H / 2
      const thisY = cardTop(r, i) + CARD_H / 2
      const lx    = (r - 1) * COL_W + CARD_W
      const mx    = lx + COL_SPACE / 2
      const rx    = r * COL_W

      d.push(
        `M${lx},${topY}H${mx}`,    // feeder superior →
        `M${lx},${botY}H${mx}`,    // feeder inferior →
        `M${mx},${topY}V${botY}`,  // conector vertical
        `M${mx},${thisY}H${rx}`,   // → este card
      )
    }
  }
  return d.join(' ')
}

const PATHS = buildPaths()

const FASE_TO_ROUND: Record<string, number> = {
  rodada32: 0, oitavas: 1, quartas: 2, semi: 3, final: 4,
}

const LABEL_FASE: Record<string, string> = {
  rodada32: 'Rodada 32',
  oitavas:  'Oitavas',
  quartas:  'Quartas',
  semi:     'Semis',
  final:    'Final',
}

// ── Componente principal ───────────────────────────────────────
type Props = { partidas: PartidaEliminatoria[] }

export default function BracketView({ partidas }: Props) {
  // 2D: rounds[r][i] = partida | null
  const rounds: (PartidaEliminatoria | null)[][] =
    ROUND_COUNTS.map(n => Array<PartidaEliminatoria | null>(n).fill(null))

  const terceiro = partidas.find(p => p.fase === 'terceiro') ?? null

  for (const p of partidas) {
    const r = FASE_TO_ROUND[p.fase]
    if (r === undefined) continue
    const i = p.jogo - 1
    if (i >= 0 && i < ROUND_COUNTS[r]) rounds[r][i] = p
  }

  return (
    <div className="overflow-x-auto pb-4">
      {/* Cabeçalhos das fases */}
      <div className="mb-2 flex" style={{ width: TOTAL_W }}>
        {ROUND_COUNTS.map((_, r) => (
          <div
            key={r}
            className="shrink-0 text-center text-[9px] font-semibold uppercase tracking-wider text-[var(--mist)]"
            style={{ width: r < ROUND_COUNTS.length - 1 ? COL_W : CARD_W }}
          >
            {LABEL_FASE[Object.keys(FASE_TO_ROUND)[r]]}
          </div>
        ))}
      </div>

      {/* Bracket */}
      <div className="relative" style={{ width: TOTAL_W, height: TOTAL_H }}>
        {/* Linhas SVG */}
        <svg
          width={TOTAL_W}
          height={TOTAL_H}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <path d={PATHS} fill="none" stroke="var(--line)" strokeWidth="1" />
        </svg>

        {/* Mini-cards */}
        {rounds.map((round, r) =>
          round.map((partida, i) => (
            <div
              key={`${r}-${i}`}
              className="absolute"
              style={{ top: cardTop(r, i), left: r * COL_W, width: CARD_W, height: CARD_H }}
            >
              <MiniCard partida={partida} />
            </div>
          ))
        )}
      </div>

      {/* Disputa de 3º lugar — abaixo do bracket */}
      {terceiro && (
        <div className="mt-6" style={{ width: CARD_W }}>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--mist)]">
            3º lugar
          </p>
          <div style={{ height: CARD_H }}>
            <MiniCard partida={terceiro} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── MiniCard ───────────────────────────────────────────────────
function MiniCard({ partida }: { partida: PartidaEliminatoria | null }) {
  if (!partida) {
    return <div className="h-full w-full rounded-lg border border-[var(--line)]/30 bg-[var(--turf)] opacity-30" />
  }

  const { selecao_casa, selecao_fora, gols_casa, gols_fora, penaltis_casa, penaltis_fora, status } = partida

  const aDefinir  = status === 'a_definir'
  const encerrada = status === 'encerrada'
  const aoVivo    = status === 'ao_vivo'

  const vencedor =
    encerrada && gols_casa != null && gols_fora != null
      ? penaltis_casa != null && penaltis_fora != null
        ? penaltis_casa > penaltis_fora ? 'casa' : 'fora'
        : gols_casa > gols_fora ? 'casa' : gols_fora > gols_casa ? 'fora' : null
      : null

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-lg border bg-[var(--turf)] ${
        aoVivo ? 'border-[var(--copa-red)]' : 'border-[var(--line)]'
      }`}
    >
      <LinhaTime
        selecao={selecao_casa}
        gols={gols_casa}
        penaltis={penaltis_casa ?? null}
        aDefinir={aDefinir}
        venceu={vencedor === 'casa'}
        perdeu={vencedor === 'fora'}
      />
      <div className="shrink-0 border-t border-[var(--line)]" />
      <LinhaTime
        selecao={selecao_fora}
        gols={gols_fora}
        penaltis={penaltis_fora ?? null}
        aDefinir={aDefinir}
        venceu={vencedor === 'fora'}
        perdeu={vencedor === 'casa'}
      />
    </div>
  )
}

// ── LinhaTime ──────────────────────────────────────────────────
type SelecaoInfo = { id: number; nome: string; codigo: string; bandeira: string } | null

function LinhaTime({
  selecao, gols, penaltis, aDefinir, venceu, perdeu,
}: {
  selecao: SelecaoInfo
  gols: number | null
  penaltis: number | null
  aDefinir: boolean
  venceu: boolean
  perdeu: boolean
}) {
  return (
    <div className={`flex flex-1 items-center gap-1.5 px-2 ${perdeu ? 'opacity-40' : ''}`}>
      {aDefinir || !selecao ? (
        <span className="w-5 text-center text-xs text-[var(--line)]">?</span>
      ) : (
        <Bandeira codigo={selecao.codigo} emoji={selecao.bandeira} nome={selecao.nome} tamanho="sm" />
      )}
      <span
        className={`min-w-0 flex-1 truncate text-[11px] font-medium leading-tight ${
          venceu ? 'text-[var(--chalk)]' : 'text-[var(--mist)]'
        }`}
      >
        {aDefinir || !selecao ? 'A definir' : selecao.nome}
      </span>
      {gols !== null && (
        <span
          className={`tnum shrink-0 font-display text-sm font-bold ${
            venceu ? 'text-[var(--chalk)]' : 'text-[var(--mist)]'
          }`}
        >
          {gols}
          {penaltis !== null && (
            <span className="ml-0.5 text-[9px] font-normal text-[var(--mist)]">({penaltis})</span>
          )}
        </span>
      )}
    </div>
  )
}
