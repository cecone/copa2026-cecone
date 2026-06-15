import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import Bandeira from './Bandeira'

type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }
type Row = {
  id: number
  fase: string
  data_hora: string
  gols_casa: number | null
  gols_fora: number | null
  status: string
  minuto: number | null
  selecao_casa: SelecaoRow | SelecaoRow[] | null
  selecao_fora: SelecaoRow | SelecaoRow[] | null
}

const um = (s: SelecaoRow | SelecaoRow[] | null) => (Array.isArray(s) ? s[0] : s)

const COLUNAS = `
  id, fase, data_hora, gols_casa, gols_fora, status, minuto,
  selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
  selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
`

export default async function HeroProximoJogo() {
  const supabase = await createClient()

  // 1) Tem jogo ao vivo?
  let { data } = await supabase
    .from('partidas')
    .select(COLUNAS)
    .eq('status', 'ao_vivo')
    .order('data_hora', { ascending: true })
    .limit(1)

  // 2) Senão, o próximo agendado
  if (!data || data.length === 0) {
    const r = await supabase
      .from('partidas')
      .select(COLUNAS)
      .eq('status', 'agendada')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
    data = r.data
  }

  const row = (data?.[0] as unknown as Row) ?? null
  if (!row) return null

  const casa = um(row.selecao_casa)
  const fora = um(row.selecao_fora)
  if (!casa || !fora) return null

  const aoVivo = row.status === 'ao_vivo'
  const dt = new Date(row.data_hora)
  const dataFmt = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' })
  const horaFmt = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

  return (
    <Link
      href="/partidas"
      className={`group relative block w-full overflow-hidden rounded-3xl border bg-gradient-to-b from-[var(--turf-2)] to-[var(--turf)] p-5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.8)] transition-colors ${
        aoVivo ? 'border-[var(--copa-red)]/60' : 'border-[var(--line)]'
      }`}
    >
      {/* Motivo de campo: linha central + círculo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/5" />
        <div className="absolute left-1/2 top-[55%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      </div>

      {/* Topo */}
      <div className="relative mb-5 flex items-center justify-between">
        {aoVivo ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--copa-red)]">
            <span className="h-2 w-2 rounded-full bg-[var(--copa-red)] animate-pulse motion-reduce:animate-none" />
            Ao vivo
          </span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--copa-gold)]">
            Próximo jogo
          </span>
        )}
        <span className="text-[11px] text-[var(--mist)]">{row.fase}</span>
      </div>

      {/* Placar */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <Bandeira codigo={casa.codigo} emoji={casa.bandeira} nome={casa.nome} tamanho="xl" />
          <span className="font-display text-base font-semibold uppercase text-[var(--chalk)]">{casa.nome}</span>
        </div>

        <div className="flex flex-col items-center">
          {aoVivo ? (
            <div className="flex items-baseline gap-2 font-display font-bold tnum text-[var(--chalk)]">
              <span className="text-5xl">{row.gols_casa ?? 0}</span>
              <span className="text-2xl text-[var(--mist)]">–</span>
              <span className="text-5xl">{row.gols_fora ?? 0}</span>
            </div>
          ) : (
            <span className="font-display text-4xl font-bold tnum text-[var(--chalk)]">{horaFmt}</span>
          )}
          <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--mist)]">
            {aoVivo ? `${row.minuto ?? ''}'` : dataFmt}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Bandeira codigo={fora.codigo} emoji={fora.bandeira} nome={fora.nome} tamanho="xl" />
          <span className="font-display text-base font-semibold uppercase text-[var(--chalk)]">{fora.nome}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="relative mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--mist)] transition-colors group-hover:text-[var(--chalk)]">
        {aoVivo ? 'Acompanhar lance a lance' : 'Ver todas as partidas'}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}
