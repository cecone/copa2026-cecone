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

  // 1) Jogos ao vivo (sem limit — pode haver 2 simultâneos na Rodada 3)
  let { data: vivos } = await supabase
    .from('partidas')
    .select(COLUNAS)
    .eq('status', 'ao_vivo')
    .order('data_hora', { ascending: true })

  // 2) Senão, o próximo agendado
  if (!vivos || vivos.length === 0) {
    const r = await supabase
      .from('partidas')
      .select(COLUNAS)
      .eq('status', 'agendada')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
    vivos = r.data
  }

  if (!vivos || vivos.length === 0) return null

  // Múltiplos jogos ao vivo → card resumido
  if (vivos.length > 1) {
    const jogos = vivos.map(r => r as unknown as Row)
    return (
      <Link
        href="/partidas"
        className="group relative block w-full overflow-hidden rounded-3xl border border-[var(--copa-red)]/60 bg-gradient-to-b from-[var(--turf-2)] to-[var(--turf)] p-5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.8)] transition-colors"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/5" />
          <div className="absolute left-1/2 top-[55%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        </div>

        <div className="relative mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--copa-red)] animate-pulse motion-reduce:animate-none" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--copa-red)]">
            {jogos.length} jogos ao vivo
          </span>
        </div>

        <div className="relative flex flex-col gap-3">
          {jogos.map(row => {
            const casa = um(row.selecao_casa)
            const fora = um(row.selecao_fora)
            if (!casa || !fora) return null
            return (
              <div key={row.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Bandeira codigo={casa.codigo} emoji={casa.bandeira} nome={casa.nome} tamanho="sm" />
                  <span className="font-display text-sm font-semibold uppercase text-[var(--chalk)] truncate">{casa.nome}</span>
                </div>
                <span className="font-display text-lg font-bold tnum text-[var(--chalk)] shrink-0">
                  {row.gols_casa ?? 0} – {row.gols_fora ?? 0}
                </span>
                <div className="flex items-center gap-2 justify-end min-w-0">
                  <span className="font-display text-sm font-semibold uppercase text-[var(--chalk)] truncate">{fora.nome}</span>
                  <Bandeira codigo={fora.codigo} emoji={fora.bandeira} nome={fora.nome} tamanho="sm" />
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--mist)] transition-colors group-hover:text-[var(--chalk)]">
          Acompanhar lance a lance
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </Link>
    )
  }

  // Jogo único (ao vivo ou próximo)
  const row = vivos[0] as unknown as Row
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
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/5" />
        <div className="absolute left-1/2 top-[55%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      </div>

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

      <div className="relative mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--mist)] transition-colors group-hover:text-[var(--chalk)]">
        {aoVivo ? 'Acompanhar lance a lance' : 'Ver todas as partidas'}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  )
}
