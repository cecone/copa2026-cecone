import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import FormPalpite from '@/components/FormPalpite'
import FormPalpiteEspecial from '@/components/FormPalpiteEspecial'
import Rodada from '@/components/Rodada'
import { Partida } from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }
type PartidaRow = {
  id: number; fase: string; fase_tipo: string; data_hora: string;
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

// Rodada da fase de grupos a partir da data (fuso BR, comparação por string YYYY-MM-DD)
function rodadaGrupo(data: string): number {
  if (data <= '2026-06-17') return 1 // Rodada 1: 11–17/jun
  if (data <= '2026-06-23') return 2 // Rodada 2: 18–23/jun
  return 3                           // Rodada 3: 24–27/jun
}

// Rótulos e ordem das fases do mata-mata
const LABEL_KO: Record<string, string> = {
  rodada32: 'Rodada de 32',
  oitavas: 'Oitavas',
  quartas: 'Quartas',
  semi: 'Semifinais',
  terceiro: 'Disputa de 3º',
  final: 'Final',
}
const ORDEM_KO = ['rodada32', 'oitavas', 'quartas', 'semi', 'terceiro', 'final']

// Times definidos? (sentinela id 0 = "A definir")
function temTimes(p: Partida): boolean {
  return p.selecao_casa.id !== 0 && p.selecao_fora.id !== 0
}

function pontosPalpite(p: Partida, palpite?: { gols_casa: number; gols_fora: number } | null): number {
  if (p.status !== 'encerrada' || !palpite) return 0
  if (p.gols_casa === null || p.gols_fora === null) return 0
  if (palpite.gols_casa === p.gols_casa && palpite.gols_fora === p.gols_fora) return 7
  if (Math.sign(p.gols_casa - p.gols_fora) === Math.sign(palpite.gols_casa - palpite.gols_fora)) return 3
  return 0
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

  // TODAS as partidas (grupos + mata-mata)
  const { data: partidasData } = await admin
    .from('partidas')
    .select(`
      id, fase, fase_tipo, data_hora, gols_casa, gols_fora, status, minuto,
      selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
      selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
    `)
    .order('data_hora', { ascending: true })

  const itens = (partidasData ?? []).map(r => {
    const row = r as unknown as PartidaRow
    return { faseTipo: row.fase_tipo, partida: rowToPartida(row) }
  })
  const partidas = itens.map(x => x.partida)

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

  // Palpites do grupo por partida — só jogos que já começaram (privacidade no servidor)
  const partidaPorId = new Map(partidas.map(p => [p.id, p]))
  const palpitesGrupoPorPartida = new Map<number, {
    nome: string; gols_casa: number; gols_fora: number; pontos: number | null; euMesmo: boolean
  }[]>()

  for (const palp of todosPalpites ?? []) {
    const partida = partidaPorId.get(palp.partida_id)
    if (!partida || partida.status === 'agendada') continue
    const lista = palpitesGrupoPorPartida.get(palp.partida_id) ?? []
    lista.push({
      nome: nomesPorId.get(palp.user_id) ?? 'Participante',
      gols_casa: palp.gols_casa,
      gols_fora: palp.gols_fora,
      pontos: partida.status === 'encerrada' ? pontosPalpite(partida, palp) : null,
      euMesmo: palp.user_id === user.id,
    })
    palpitesGrupoPorPartida.set(palp.partida_id, lista)
  }
  for (const lista of palpitesGrupoPorPartida.values()) {
    lista.sort((a, b) => {
      if (a.euMesmo !== b.euMesmo) return a.euMesmo ? -1 : 1
      if ((b.pontos ?? 0) !== (a.pontos ?? 0)) return (b.pontos ?? 0) - (a.pontos ?? 0)
      return a.nome.localeCompare(b.nome)
    })
  }

  // ── Seções: grupos (Rodada 1/2/3) → mata-mata por fase ──
  const secoes: { chave: string; titulo: string; jogos: Partida[] }[] = []

  const porRodada = new Map<number, Partida[]>()
  for (const x of itens) {
    if (x.faseTipo !== 'grupos') continue
    const r = rodadaGrupo(x.partida.data)
    const arr = porRodada.get(r) ?? []
    arr.push(x.partida)
    porRodada.set(r, arr)
  }
  for (const r of Array.from(porRodada.keys()).sort((a, b) => a - b)) {
    secoes.push({ chave: `g${r}`, titulo: `Rodada ${r}`, jogos: porRodada.get(r)! })
  }

  for (const ft of ORDEM_KO) {
    const jogos = itens.filter(x => x.faseTipo === ft).map(x => x.partida)
    if (jogos.length) secoes.push({ chave: ft, titulo: LABEL_KO[ft], jogos })
  }

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

        {/* Palpites por fase (grupos + mata-mata) */}
        <h2 className="mb-4 font-display text-xl font-bold uppercase text-[var(--chalk)]">Seus palpites</h2>
        {partidas.length === 0 ? (
          <p className="text-sm text-[var(--mist)]">Os jogos ainda não foram carregados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {secoes.map(sec => {
              const jogos = sec.jogos
              const abertos = jogos.filter(j => j.status === 'agendada' && temTimes(j)).length
              const temAcao = jogos.some(j => (j.status === 'agendada' && temTimes(j)) || j.status === 'ao_vivo')
              const pontosSecao = jogos.reduce((acc, j) => acc + pontosPalpite(j, palpitePorPartida[j.id]), 0)
              const sub = abertos > 0
                ? `${jogos.length} jogos · ${abertos} a palpitar`
                : `${jogos.length} jogos`
              return (
                <Rodada
                  key={sec.chave}
                  titulo={sec.titulo}
                  subtitulo={sub}
                  pontos={pontosSecao}
                  defaultAberta={temAcao}
                >
                  {jogos.map(partida => (
                    <FormPalpite
                      key={partida.id}
                      partida={partida}
                      grupoId={id}
                      palpiteAtual={palpitePorPartida[partida.id] ?? null}
                      palpitesGrupo={palpitesGrupoPorPartida.get(partida.id)}
                    />
                  ))}
                </Rodada>
              )
            })}
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
