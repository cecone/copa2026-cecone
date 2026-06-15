import { Fragment } from 'react'

type Evento = {
  tipo: 'gol' | 'gol_contra' | 'amarelo' | 'vermelho'
  minuto: number
  acrescimo?: number | null
  jogador: string
  time_codigo: string
}

const LABELS: Record<Evento['tipo'], string> = {
  gol: 'Gol',
  gol_contra: 'Gol contra',
  amarelo: 'Amarelo',
  vermelho: 'Vermelho',
}

export default function LinhaDoTempo({
  eventos,
  casaCodigo,
}: {
  eventos: Evento[]
  casaCodigo: string
}) {
  if (!eventos || eventos.length === 0) return null

  const ordenados = [...eventos].sort(
    (a, b) => a.minuto - b.minuto || (a.acrescimo ?? 0) - (b.acrescimo ?? 0)
  )

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--turf)] p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase text-[var(--chalk)]">Linha do tempo</h2>
      <div className="grid grid-cols-[46px_1fr]">
        {ordenados.map((ev, i) => {
          const ehCasa = ev.time_codigo === casaCodigo
          const ultimo = i === ordenados.length - 1
          const minuto = `${ev.minuto}${ev.acrescimo ? `+${ev.acrescimo}` : ''}'`
          return (
            <Fragment key={i}>
              <div className="tnum pr-3 text-right font-display text-base font-bold text-[var(--copa-gold)]">
                {minuto}
              </div>
              <div className={`relative border-l-2 border-[var(--copa-gold)]/25 pl-[18px] ${ultimo ? '' : 'pb-4'}`}>
                <Marcador tipo={ev.tipo} />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[var(--chalk)]">
                    <b className="font-semibold">{ev.jogador}</b>{' '}
                    <span className="text-[11px] text-[var(--mist)]">{LABELS[ev.tipo]}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] ${
                      ehCasa
                        ? 'bg-[var(--copa-gold)]/10 text-[var(--copa-gold)]'
                        : 'bg-[var(--copa-blue)]/20 text-[var(--copa-blue)]'
                    }`}
                  >
                    {ev.time_codigo}
                  </span>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

function Marcador({ tipo }: { tipo: Evento['tipo'] }) {
  if (tipo === 'gol' || tipo === 'gol_contra') {
    return <span className="absolute left-[-7px] top-0.5 h-3 w-3 rounded-full border-2 border-[var(--turf)] bg-[var(--copa-gold)]" />
  }
  const cor = tipo === 'vermelho' ? '#FF5436' : '#F4C534'
  return <span style={{ background: cor }} className="absolute left-[-6px] top-0.5 h-3 w-[9px] rounded-sm border border-[var(--turf)]" />
}
