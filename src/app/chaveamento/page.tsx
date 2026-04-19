'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CardEliminatoria from '@/components/CardEliminatoria'
import { PartidaEliminatoria } from '@/lib/dados-mock'
import { FaseEliminatoria } from '@/types'
import { createClient } from '@/lib/supabase'

const fases: { id: FaseEliminatoria | 'todas'; label: string }[] = [
  { id: 'todas',    label: 'Todas' },
  { id: 'rodada32', label: 'Rodada de 32' },
  { id: 'oitavas',  label: 'Oitavas' },
  { id: 'quartas',  label: 'Quartas' },
  { id: 'semi',     label: 'Semifinais' },
  { id: 'terceiro', label: '3º Lugar' },
  { id: 'final',    label: 'Final' },
]

const labelFase: Record<FaseEliminatoria, string> = {
  rodada32: 'Rodada de 32',
  oitavas:  'Oitavas de Final',
  quartas:  'Quartas de Final',
  semi:     'Semifinais',
  terceiro: 'Disputa de 3º Lugar',
  final:    'Grande Final',
}

type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }
type PartidaRow = {
  id: number; fase: string; fase_tipo: string; data_hora: string;
  gols_casa: number | null; gols_fora: number | null;
  penaltis_casa: number | null; penaltis_fora: number | null;
  status: string; minuto: number | null;
  selecao_casa: SelecaoRow | SelecaoRow[] | null
  selecao_fora: SelecaoRow | SelecaoRow[] | null
}

function rowToEliminatoria(row: PartidaRow, jogo: number): PartidaEliminatoria {
  const selCasa = Array.isArray(row.selecao_casa) ? row.selecao_casa[0] : row.selecao_casa
  const selFora = Array.isArray(row.selecao_fora) ? row.selecao_fora[0] : row.selecao_fora
  const dt = new Date(row.data_hora)
  const semTimes = !selCasa && !selFora
  return {
    id: row.id,
    fase: row.fase_tipo as FaseEliminatoria,
    jogo,
    data: dt.toISOString().slice(0, 10),
    hora: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
    selecao_casa: selCasa ? { id: selCasa.id, nome: selCasa.nome, codigo: selCasa.codigo, bandeira: selCasa.bandeira } : null,
    selecao_fora: selFora ? { id: selFora.id, nome: selFora.nome, codigo: selFora.codigo, bandeira: selFora.bandeira } : null,
    gols_casa: row.gols_casa,
    gols_fora: row.gols_fora,
    penaltis_casa: row.penaltis_casa,
    penaltis_fora: row.penaltis_fora,
    status: semTimes ? 'a_definir' : (row.status as PartidaEliminatoria['status']),
    minuto: row.minuto ?? undefined,
  }
}

export default function ChaveamentoPage() {
  const [faseSelecionada, setFaseSelecionada] = useState<FaseEliminatoria | 'todas'>('todas')
  const [partidas, setPartidas] = useState<PartidaEliminatoria[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('partidas')
      .select(`
        id, fase, fase_tipo, data_hora, gols_casa, gols_fora,
        penaltis_casa, penaltis_fora, status, minuto,
        selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
        selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
      `)
      .neq('fase_tipo', 'grupos')
      .order('data_hora', { ascending: true })
      .then(({ data }) => {
        const contadorPorFase: Record<string, number> = {}
        setPartidas(
          (data ?? []).map(row => {
            const r = row as unknown as PartidaRow
            contadorPorFase[r.fase_tipo] = (contadorPorFase[r.fase_tipo] ?? 0) + 1
            return rowToEliminatoria(r, contadorPorFase[r.fase_tipo])
          })
        )
      })
  }, [])

  const lista = faseSelecionada === 'todas'
    ? partidas
    : partidas.filter(p => p.fase === faseSelecionada)

  const porFase = (['rodada32', 'oitavas', 'quartas', 'semi', 'terceiro', 'final'] as FaseEliminatoria[])
    .reduce<Record<FaseEliminatoria, PartidaEliminatoria[]>>((acc, f) => {
      acc[f] = lista.filter(p => p.fase === f)
      return acc
    }, {} as Record<FaseEliminatoria, PartidaEliminatoria[]>)

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
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

        {partidas.length === 0 && (
          <p className="text-white/40 text-center py-16">
            A fase eliminatória ainda não foi carregada.
          </p>
        )}

        {/* Partidas por fase */}
        {(Object.keys(porFase) as FaseEliminatoria[]).map(fase => {
          const items = porFase[fase]
          if (items.length === 0) return null
          return (
            <div key={fase} className="mb-8">
              {faseSelecionada === 'todas' && (
                <h3 className="text-sm text-white/40 font-semibold uppercase tracking-wider mb-3">
                  {labelFase[fase]}
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(p => <CardEliminatoria key={p.id} partida={p} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
