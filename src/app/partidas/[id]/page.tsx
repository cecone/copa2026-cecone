import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase-server'
import Bandeira from '@/components/Bandeira'
import EstatisticasPartida from '@/components/EstatisticasPartida'
import LinhaDoTempo from '@/components/LinhaDoTempo'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 30

type Props = { params: Promise<{ id: string }> }
type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }

export default async function PartidaDetalhePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: p } = await supabase
    .from('partidas')
    .select(`
      id, fase, data_hora, gols_casa, gols_fora, status, minuto,
      selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
      selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
    `)
    .eq('id', id)
    .maybeSingle()

  if (!p) notFound()

  const casa = (Array.isArray(p.selecao_casa) ? p.selecao_casa[0] : p.selecao_casa) as SelecaoRow | null
  const fora = (Array.isArray(p.selecao_fora) ? p.selecao_fora[0] : p.selecao_fora) as SelecaoRow | null

  const { data: stats } = await supabase
    .from('partida_stats')
    .select('*')
    .eq('partida_id', id)
    .maybeSingle()

  const aoVivo = p.status === 'ao_vivo'
  const encerrada = p.status === 'encerrada'
  const temPlacar = p.gols_casa !== null && p.gols_fora !== null
  const dt = p.data_hora ? new Date(p.data_hora) : null
  const hora = dt
    ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    : ''

  return (
    <div className="min-h-screen px-4 pb-16 pt-6 sm:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/partidas" className="inline-flex items-center gap-2 text-sm text-[var(--mist)] transition-colors hover:text-[var(--chalk)]">
            <span aria-hidden>←</span> Partidas
          </Link>
          <LogoApp horizontal />
        </header>

        {/* Placar */}
        <div className={`mb-5 rounded-2xl border bg-[var(--turf)] p-5 ${aoVivo ? 'border-[var(--copa-red)]' : 'border-[var(--line)]'}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mist)]">
              {aoVivo ? `${p.minuto ?? ''}'` : encerrada ? 'Encerrado' : hora}
            </span>
            <span className="text-[11px] text-[var(--mist)]">{p.fase}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              {casa && <Bandeira codigo={casa.codigo} emoji={casa.bandeira} nome={casa.nome} tamanho="lg" />}
              <span className="font-display text-base font-semibold uppercase text-[var(--chalk)]">{casa?.nome ?? 'A definir'}</span>
            </div>
            <div className="flex items-baseline gap-2 font-display font-bold tnum text-[var(--chalk)]">
              {temPlacar ? (
                <>
                  <span className="text-5xl">{p.gols_casa}</span>
                  <span className="text-2xl text-[var(--mist)]">–</span>
                  <span className="text-5xl">{p.gols_fora}</span>
                </>
              ) : (
                <span className="text-3xl text-[var(--mist)]">VS</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {fora && <Bandeira codigo={fora.codigo} emoji={fora.bandeira} nome={fora.nome} tamanho="lg" />}
              <span className="font-display text-base font-semibold uppercase text-[var(--chalk)]">{fora?.nome ?? 'A definir'}</span>
            </div>
          </div>
        </div>

        {/* Estatísticas + linha do tempo */}
        {stats ? (
          <div className="flex flex-col gap-5">
            <EstatisticasPartida stats={stats} />
            <LinhaDoTempo eventos={stats.eventos ?? []} casaCodigo={casa?.codigo ?? ''} />
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--turf)] py-12 text-center">
            <p className="font-display text-lg uppercase text-[var(--chalk)]">Estatísticas a caminho</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--mist)]">
              {encerrada
                ? 'Os dados aparecem alguns minutos após o apito final.'
                : 'Ficam disponíveis quando o jogo terminar.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
