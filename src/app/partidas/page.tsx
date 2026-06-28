'use client'

import { useState, useEffect } from 'react'
import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase'
import CardPartida from '@/components/CardPartida'
import { Partida } from '@/types'
import Link from 'next/link'

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function formatarData(dataStr: string) {
  const data = new Date(dataStr + 'T12:00:00')
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Retorna o label da seção para partidas encerradas
function labelSecao(p: Partida): string {
  if (p.fase.startsWith('Grupo')) {
    const data = p.data  // YYYY-MM-DD
    if (data <= '2026-06-17') return 'Rodada 1'
    if (data <= '2026-06-23') return 'Rodada 2'
    return 'Rodada 3'
  }
  return p.fase  // "Rodada de 32", "Oitavas de Final", etc.
}

// Ordem das seções encerradas (mais recente primeiro)
const ORDEM_SECOES = [
  'Rodada de 32',
  'Rodada 3',
  'Rodada 2',
  'Rodada 1',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinais',
  'Disputa do 3º Lugar',
  'Final',
]

// ----------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------
type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }
type SupabasePartida = {
  id: number; fase: string; fase_tipo: string; data_hora: string;
  gols_casa: number | null; gols_fora: number | null;
  status: string; minuto: number | null;
  selecao_casa: SelecaoRow | SelecaoRow[] | null
  selecao_fora: SelecaoRow | SelecaoRow[] | null
}

function rowToPartida(row: SupabasePartida): Partida {
  const selCasa = Array.isArray(row.selecao_casa) ? row.selecao_casa[0] : row.selecao_casa
  const selFora = Array.isArray(row.selecao_fora) ? row.selecao_fora[0] : row.selecao_fora
  const dt = new Date(row.data_hora)
  return {
    id: row.id,
    fase: row.fase,
    fase_tipo: row.fase_tipo,
    data: dt.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
    hora: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
    selecao_casa: selCasa
      ? { id: selCasa.id, nome: selCasa.nome, codigo: selCasa.codigo, bandeira: selCasa.bandeira }
      : { id: 0, nome: 'A definir', codigo: '?', bandeira: '❓' },
    selecao_fora: selFora
      ? { id: selFora.id, nome: selFora.nome, codigo: selFora.codigo, bandeira: selFora.bandeira }
      : { id: 0, nome: 'A definir', codigo: '?', bandeira: '❓' },
    gols_casa: row.gols_casa,
    gols_fora: row.gols_fora,
    status: row.status as Partida['status'],
    minuto: row.minuto ?? undefined,
  }
}

// ----------------------------------------------------------------
// Componente de seção colapsável (encerradas)
// ----------------------------------------------------------------
function SecaoEncerrada({ label, partidas }: { label: string; partidas: Partida[] }) {
  const [aberta, setAberta] = useState(false)
  return (
    <div className="mb-4">
      <button
        onClick={() => setAberta(a => !a)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--turf)] px-4 py-3 text-left transition-colors hover:border-[var(--mist)]"
      >
        <span className="text-sm font-bold uppercase tracking-wider text-[var(--mist)]">{label}</span>
        <span className="text-xs text-[var(--mist)]">
          {partidas.length} {partidas.length === 1 ? 'jogo' : 'jogos'} {aberta ? '▲' : '▼'}
        </span>
      </button>
      {aberta && (
        <div className="mt-2 flex flex-col gap-3">
          {partidas.map(p => (
            <Link key={p.id} href={`/partidas/${p.id}`}>
              <CardPartida partida={p} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------
// Página
// ----------------------------------------------------------------
export default function PartidasPage() {
  const [partidas, setPartidas] = useState<Partida[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('partidas')
      .select(`
        id, fase, fase_tipo, data_hora, gols_casa, gols_fora, status, minuto,
        selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
        selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
      `)
      .order('data_hora', { ascending: true })
      .then(({ data }) => {
        setPartidas((data ?? []).map(r => rowToPartida(r as unknown as SupabasePartida)))
      })
  }, [])

  const aoVivo    = partidas.filter(p => p.status === 'ao_vivo')
  const proximas  = partidas.filter(p => p.status === 'agendada')
  const encerradas = partidas.filter(p => p.status === 'encerrada')

  // Próximas: agrupar por data
  const porData = proximas.reduce<Record<string, Partida[]>>((acc, p) => {
    if (!acc[p.data]) acc[p.data] = []
    acc[p.data].push(p)
    return acc
  }, {})
  const datas = Object.keys(porData).sort()

  // Encerradas: agrupar por seção
  const porSecao = encerradas.reduce<Record<string, Partida[]>>((acc, p) => {
    const label = labelSecao(p)
    if (!acc[label]) acc[label] = []
    acc[label].push(p)
    return acc
  }, {})
  const secoesComJogos = ORDEM_SECOES.filter(s => porSecao[s]?.length > 0)

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-[var(--mist)] hover:text-[var(--chalk)] text-sm transition-colors">
            ← Início
          </Link>
          <LogoApp horizontal />
        </div>

        <h2 className="font-display text-2xl font-bold uppercase text-[var(--chalk)] mb-6">Partidas</h2>

        {partidas.length === 0 && (
          <p className="text-[var(--mist)] text-center py-16">
            Carregando partidas…
          </p>
        )}

        {/* Ao vivo */}
        {aoVivo.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--copa-red)] animate-pulse" />
              <span className="text-sm font-bold text-[var(--copa-red)] uppercase tracking-wider">Ao vivo agora</span>
            </div>
            <div className="flex flex-col gap-3">
              {aoVivo.map(p => (
                <Link key={p.id} href={`/partidas/${p.id}`}>
                  <CardPartida partida={p} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Próximas */}
        {datas.length > 0 && (
          <div className="mb-8">
            {datas.map(data => (
              <div key={data} className="mb-6">
                <h3 className="text-sm text-[var(--mist)] font-semibold uppercase tracking-wider mb-3 capitalize">
                  {formatarData(data)}
                </h3>
                <div className="flex flex-col gap-3">
                  {porData[data].map(p => (
                    <Link key={p.id} href={`/partidas/${p.id}`}>
                      <CardPartida partida={p} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Encerradas por rodada/fase (colapsáveis) */}
        {secoesComJogos.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mist)] mb-3">Encerradas</p>
            {secoesComJogos.map(label => (
              <SecaoEncerrada key={label} label={label} partidas={porSecao[label]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
