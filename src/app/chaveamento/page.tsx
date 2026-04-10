'use client'

import { useState } from 'react'
import Link from 'next/link'
import CardEliminatoria from '@/components/CardEliminatoria'
import { chaveamentoMock, PartidaEliminatoria } from '@/lib/dados-mock'
import { FaseEliminatoria } from '@/types'

const fases: { id: FaseEliminatoria | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'oitavas', label: 'Oitavas' },
  { id: 'quartas', label: 'Quartas' },
  { id: 'semi', label: 'Semifinais' },
  { id: 'terceiro', label: '3º Lugar' },
  { id: 'final', label: 'Final' },
]

const labelFase: Record<FaseEliminatoria, string> = {
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semi: 'Semifinais',
  terceiro: 'Disputa de 3º Lugar',
  final: 'Grande Final',
}

export default function ChaveamentoPage() {
  const [faseSelecionada, setFaseSelecionada] = useState<FaseEliminatoria | 'todas'>('todas')

  const partidas = faseSelecionada === 'todas'
    ? chaveamentoMock
    : chaveamentoMock.filter(p => p.fase === faseSelecionada)

  // Agrupar por fase quando mostrar todas
  const porFase = (['oitavas', 'quartas', 'semi', 'terceiro', 'final'] as FaseEliminatoria[]).reduce<
    Record<FaseEliminatoria, PartidaEliminatoria[]>
  >((acc, fase) => {
    acc[fase] = partidas.filter(p => p.fase === fase)
    return acc
  }, {} as Record<FaseEliminatoria, PartidaEliminatoria[]>)

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Início
          </Link>
          <h1 className="text-xl font-black text-[var(--copa-gold)] tracking-tight">
            Copa 2026 do Cecone
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Fase Eliminatória</h2>

        {/* Filtro de fases */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {fases.map(f => (
            <button
              key={f.id}
              onClick={() => setFaseSelecionada(f.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                faseSelecionada === f.id
                  ? 'bg-[var(--copa-gold)] text-black'
                  : 'bg-[var(--surface)] text-white/50 border border-white/10 hover:border-white/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Partidas */}
        {(Object.keys(porFase) as FaseEliminatoria[]).map(fase => {
          const lista = porFase[fase]
          if (lista.length === 0) return null
          return (
            <div key={fase} className="mb-8">
              {faseSelecionada === 'todas' && (
                <h3 className="text-sm text-white/40 font-semibold uppercase tracking-wider mb-3">
                  {labelFase[fase]}
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lista.map(p => (
                  <CardEliminatoria key={p.id} partida={p} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
