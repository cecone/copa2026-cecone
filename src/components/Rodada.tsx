'use client'

import { useState } from 'react'

type Props = {
  titulo: string
  subtitulo: string
  pontos: number
  defaultAberta: boolean
  children: React.ReactNode
}

export default function Rodada({ titulo, subtitulo, pontos, defaultAberta, children }: Props) {
  const [aberta, setAberta] = useState(defaultAberta)

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--turf)]">
      {/* Cabeçalho */}
      <button
        onClick={() => setAberta(v => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-[var(--turf-2)]"
        aria-expanded={aberta}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-[var(--chalk)]">
            {titulo}
          </span>
          <span className="text-xs text-[var(--mist)]">{subtitulo}</span>
        </div>

        <div className="flex items-center gap-3">
          {!defaultAberta && pontos > 0 && (
            <span className="font-display text-sm font-bold text-[var(--copa-gold)]">
              <span className="tnum">{pontos}</span>
              <span className="ml-1 text-xs font-medium text-[var(--mist)]">pts</span>
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--mist)] transition-transform duration-200 ${aberta ? 'rotate-180' : ''}`}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Jogos */}
      {aberta && (
        <div className="flex flex-col gap-3 border-t border-[var(--line)] p-3">
          {children}
        </div>
      )}
    </div>
  )
}
