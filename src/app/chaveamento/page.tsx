'use client'

import { useState, useEffect } from 'react'
import LogoApp from '@/components/LogoApp'
import Link from 'next/link'
import CardEliminatoria from '@/components/CardEliminatoria'
import BracketView from '@/components/BracketView'
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
  const [vista, setVista] = useState<'bracket' | 'lista'>('bracket')
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
    <div className="min-h-screen px-4 pb-16 pt-6 sm:px-8">
      <div className={`mx-auto ${vista === 'bracket' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--mist)] transition-colors hover:text-[var(--chalk)]">
            <span aria-hidden>←</span> Início
          </Link>
          <LogoApp horizontal />
        </header>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-[var(--mist)]">Copa do Mundo 2026</p>
            <h1 className="font-display text-4xl font-bold uppercase text-[var(--chalk)]">Mata-mata</h1>
          </div>

          {/* Toggle Bracket / Lista */}
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--turf)]">
            <button
              onClick={() => setVista('bracket')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                vista === 'bracket'
                  ? 'bg-[var(--copa-gold)] text-[#0A130F]'
                  : 'text-[var(--mist)] hover:text-[var(--chalk)]'
              }`}
            >
              Bracket
            </button>
            <button
              onClick={() => setVista('lista')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                vista === 'lista'
                  ? 'bg-[var(--copa-gold)] text-[#0A130F]'
                  : 'text-[var(--mist)] hover:text-[var(--chalk)]'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {partidas.length === 0 && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--turf)] py-16 text-center">
            <p className="mb-3 text-3xl">🏆</p>
            <p className="font-display text-xl uppercase text-[var(--chalk)]">Mata-mata a caminho</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--mist)]">
              Os confrontos aparecem aqui quando a fase de grupos terminar.
            </p>
          </div>
        )}

        {/* Vista: Bracket */}
        {vista === 'bracket' && partidas.length > 0 && (
          <BracketView partidas={partidas} />
        )}

        {/* Vista: Lista */}
        {vista === 'lista' && partidas.length > 0 && (
          <>
            {/* Filtro de fases */}
            <div className="scrollbar-none mb-8 flex gap-2 overflow-x-auto pb-2">
              {fases.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFaseSelecionada(f.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    faseSelecionada === f.id
                      ? 'bg-[var(--copa-gold)] text-[#0A130F]'
                      : 'border border-[var(--line)] bg-[var(--turf)] text-[var(--mist)] hover:border-[var(--mist)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {(Object.keys(porFase) as FaseEliminatoria[]).map(fase => {
              const items = porFase[fase]
              if (items.length === 0) return null
              return (
                <div key={fase} className="mb-8">
                  {faseSelecionada === 'todas' && (
                    <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-[var(--mist)]">
                      {labelFase[fase]}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map(p => <CardEliminatoria key={p.id} partida={p} />)}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
