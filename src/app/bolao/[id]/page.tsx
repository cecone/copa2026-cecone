import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import FormPalpite from '@/components/FormPalpite'
import FormPalpiteEspecial from '@/components/FormPalpiteEspecial'
import { Partida } from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }
type PartidaRow = {
  id: number; fase: string; data_hora: string;
  gols_casa: number | null; gols_fora: number | null;
  status: string; minuto: number | null;
  selecao_casa: SelecaoRow | SelecaoRow[] | null
  selecao_fora: SelecaoRow | SelecaoRow[] | null
}

function rowToPartida(row: PartidaRow): Partida {
  const selCasa = Array.isArray(row.selecao_casa) ? row.selecao_casa[0] : row.selecao_casa
  const selFora = Array.isArray(row.selecao_fora) ? row.selecao_fora[0] : row.selecao_fora
  const dt = new Date(row.data_hora)
  return {
    id: row.id,
    fase: row.fase,
    data: dt.toISOString().slice(0, 10),
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

export default async function GrupoBolaoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const admin = createAdminClient()

  const { data: grupo } = await admin
    .from('grupos_bolao')
    .select('*')
    .eq('id', id)
    .single()

  if (!grupo) notFound()

  const { data: membro } = await admin
    .from('membros_grupo')
    .select('id')
    .eq('grupo_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membro) redirect('/bolao')

  const { data: membros } = await admin
    .from('membros_grupo')
    .select('user_id')
    .eq('grupo_id', id)

  const { data: partidasData } = await admin
    .from('partidas')
    .select(`
      id, fase, data_hora, gols_casa, gols_fora, status, minuto,
      selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
      selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
    `)
    .eq('fase_tipo', 'grupos')
    .order('data_hora', { ascending: true })

  const partidas = (partidasData ?? []).map(r => rowToPartida(r as unknown as PartidaRow))

  const { data: meusPalpites } = await admin
    .from('palpites')
    .select('partida_id, gols_casa, gols_fora')
    .eq('grupo_id', id)
    .eq('user_id', user.id)

  const palpitePorPartida = Object.fromEntries(
    (meusPalpites ?? []).map(p => [p.partida_id, p])
  )

  const { data: todosPalpites } = await admin
    .from('palpites')
    .select('user_id, partida_id, gols_casa, gols_fora')
    .eq('grupo_id', id)

  const ranking = calcularRanking(membros ?? [], todosPalpites ?? [], partidas)

  const userIds = (membros ?? []).map(m => m.user_id)
  const nomesPorId = new Map<string, string>()
  await Promise.all(
    userIds.map(async (uid) => {
      const { data } = await admin.auth.admin.getUserById(uid)
      if (data.user) {
        const nome = data.user.user_metadata?.full_name as string | undefined
        nomesPorId.set(uid, nome ?? data.user.email?.split('@')[0] ?? 'Participante')
      }
    })
  )

  const { data: selecoesRaw } = await admin
    .from('selecoes')
    .select('id, nome, codigo, bandeira')
    .not('grupo', 'is', null)
    .order('nome', { ascending: true })

  const selecoes = Array.from(
    new Map((selecoesRaw ?? []).map(s => [s.codigo, s])).values()
  )

  const { data: palpiteEspecial } = await admin
    .from('palpites_especiais')
    .select('campeao_id')
    .eq('grupo_id', id)
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen px-4 pb-16 pt-6 sm:px-8">
      <div className="mx-auto max-w-lg">
        {/* Topo */}
        <header className="mb-8 flex items-center justify-between">
          <Link href="/bolao" className="inline-flex items-center gap-2 text-sm text-[var(--mist)] transition-colors hover:text-[var(--chalk)]">
            <span aria-hidden>←</span> Bolão
          </Link>
          <LogoApp horizontal />
        </header>

        {/* Nome do grupo + código */}
        <div className="mb-7">
          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-[var(--mist)]">Bolão</p>
          <h1 className="font-display text-3xl font-bold uppercase text-[var(--chalk)]">{grupo.nome}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-[var(--mist)]">Código de convite</span>
            <span className="rounded-md bg-[var(--turf-2)] px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-[var(--copa-gold)]">
              {grupo.codigo_convite}
            </span>
          </div>
        </div>

        {/* Ranking */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--turf)]">
          <div className="border-b border-[var(--line)] px-5 py-3">
            <h2 className="font-display text-base font-bold uppercase tracking-wide text-[var(--chalk)]">Ranking</h2>
          </div>
          {ranking.length === 0 ? (
            <p className="p-5 text-sm text-[var(--mist)]">Nenhum palpite registrado ainda.</p>
          ) : (
            ranking.map((r, i) => {
              const euMesmo = r.userId === user.id
              const podio = i < 3
              const selo = i === 0
                ? 'bg-[var(--copa-gold)] text-[#0A130F]'
                : podio
                ? 'border border-[var(--copa-gold)] text-[var(--copa-gold)]'
                : 'text-[var(--mist)]'
              return (
                <div
                  key={r.userId}
                  className={`relative flex items-center justify-between border-t border-[var(--line)] px-5 py-3 first:border-t-0 ${euMesmo ? 'bg-[var(--copa-blue)]/10' : ''}`}
                >
                  {euMesmo && <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-[var(--copa-blue)]" />}
                  <div className="flex items-center gap-3">
                    <span className={`grid h-6 w-6 place-items-center rounded-md font-display text-sm font-bold ${selo}`}>
                      {i + 1}
                    </span>
                    <span className={`text-sm ${euMesmo ? 'font-semibold text-[var(--chalk)]' : 'text-[var(--mist)]'}`}>
                      {euMesmo
                        ? `${user.user_metadata.full_name ?? nomesPorId.get(r.userId) ?? 'Você'} (você)`
                        : nomesPorId.get(r.userId) ?? 'Participante'}
                    </span>
                  </div>
                  <span className="font-display text-lg font-bold text-[var(--chalk)]">
                    <span className="tnum">{r.pontos}</span>
                    <span className="ml-1 text-xs font-medium text-[var(--mist)]">pts</span>
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Palpites especiais */}
        <FormPalpiteEspecial
          grupoId={id}
          selecoes={selecoes ?? []}
          palpiteAtual={palpiteEspecial ?? null}
        />

        {/* Palpites */}
        <h2 className="mb-4 font-display text-xl font-bold uppercase text-[var(--chalk)]">Seus palpites</h2>
        {partidas.length === 0 ? (
          <p className="text-sm text-[var(--mist)]">Os jogos ainda não foram carregados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {partidas.map(partida => (
              <FormPalpite
                key={partida.id}
                partida={partida}
                grupoId={id}
                palpiteAtual={palpitePorPartida[partida.id] ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function calcularRanking(
  membros: { user_id: string }[],
  palpites: { user_id: string; partida_id: number; gols_casa: number; gols_fora: number }[],
  partidas: Partida[]
) {
  const partidaMap = new Map(partidas.map(p => [p.id, p]))

  return membros
    .map(m => {
      const meusPalpites = palpites.filter(p => p.user_id === m.user_id)
      const pontos = meusPalpites.reduce((acc, p) => {
        const partida = partidaMap.get(p.partida_id)
        if (!partida || partida.status !== 'encerrada') return acc
        if (partida.gols_casa === null || partida.gols_fora === null) return acc

        if (p.gols_casa === partida.gols_casa && p.gols_fora === partida.gols_fora) return acc + 7

        const resultadoReal = Math.sign(partida.gols_casa - partida.gols_fora)
        const resultadoPalpite = Math.sign(p.gols_casa - p.gols_fora)
        if (resultadoReal === resultadoPalpite) return acc + 3

        return acc
      }, 0)
      return { userId: m.user_id, pontos }
    })
    .sort((a, b) => b.pontos - a.pontos)
}
