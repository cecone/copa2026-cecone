import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { emojiBandeira, urlBandeira, codigoDoNome, nomePtBr, NOME_PARA_CODIGO } from '@/lib/emoji-bandeiras'

// ----------------------------------------------------------------
// WC2026 API (wc2026api.com) — placares ao vivo durante o torneio
// ----------------------------------------------------------------
const WC_BASE = 'https://api.wc2026api.com'

function wcHeaders() {
  return { 'Authorization': `Bearer ${process.env.WC2026_KEY}` }
}

// ----------------------------------------------------------------
// openfootball — calendário estático (sem chave, usa GitHub)
// ----------------------------------------------------------------
const OPENFOOTBALL_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// ----------------------------------------------------------------
// Roteamento principal
// ----------------------------------------------------------------
export async function GET(req: NextRequest) {
  // Verificar segredo
  const secret =
    req.headers.get('authorization')?.replace('Bearer ', '') ??
    req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  }

  const tipo = req.nextUrl.searchParams.get('tipo') ?? 'vivo'
  const admin = createAdminClient()

  try {
    if (tipo === 'sementes') {
      // Seed inicial a partir do openfootball (sem chave de API)
      const resultado = await seedDeOpenFootball(admin)
      // Popular classificação inicial com todos os times (0 pontos)
      await seedClassificacaoInicial(admin)
      return NextResponse.json({ ok: true, tipo: 'sementes', ...resultado })
    }

    if (tipo === 'vivo') {
      await sincronizarVivo(admin)
      return NextResponse.json({ ok: true, tipo: 'vivo' })
    }

    if (tipo === 'partidas' || tipo === 'tudo') {
      await sincronizarPartidas(admin)
    }

    if (tipo === 'classificacao' || tipo === 'tudo') {
      await sincronizarClassificacao(admin)
    }

    return NextResponse.json({ ok: true, tipo })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[sincronizar]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

// ================================================================
// SEED: openfootball (calendário completo, sem chave)
// ================================================================
async function seedDeOpenFootball(admin: ReturnType<typeof createAdminClient>) {
  const res = await fetch(OPENFOOTBALL_URL)
  if (!res.ok) throw new Error('Falha ao buscar dados do openfootball')
  const json = await res.json()

  const matches: OpenFootballMatch[] = json.matches ?? []

  // Coletar times únicos por nome
  const timesMap = new Map<string, { id: number; nome: string; codigo: string; grupo: string | null }>()
  let idFake = 1000 // IDs locais para times (sem ID da API)

  for (const m of matches) {
    const time1 = m.team1
    const time2 = m.team2
    // Ignorar placeholders como "W74", "L101"
    if (!time1 || time1.startsWith('W') || time1.startsWith('L')) continue
    if (!time2 || time2.startsWith('W') || time2.startsWith('L')) continue

    for (const nome of [time1, time2]) {
      if (!timesMap.has(nome)) {
        const codigo = codigoDoNome(nome)
        const grupo = m.group?.replace('Group ', '') ?? null
        timesMap.set(nome, { id: idFake++, nome: nomePtBr(nome), codigo, grupo })
      } else if (m.group && !timesMap.get(nome)!.grupo) {
        // Atualizar grupo se ainda não foi definido
        timesMap.get(nome)!.grupo = m.group.replace('Group ', '')
      }
    }
  }

  // Upsert seleções (insert only — não sobrescrever se já existir com ID real da API)
  const selecoes = Array.from(timesMap.values()).map(t => ({
    id: t.id,
    nome: t.nome,
    codigo: t.codigo,
    bandeira: emojiBandeira(t.codigo),
    bandeira_url: urlBandeira(t.codigo),
    grupo: t.grupo,
  }))

  const { error: errSelecoes } = await admin.from('selecoes').upsert(selecoes, { onConflict: 'id' })
  if (errSelecoes) throw new Error(`Erro ao inserir seleções: ${errSelecoes.message}`)

  // Montar mapa nome → id para FK
  const nomeParaId = new Map(Array.from(timesMap.entries()).map(([nome, t]) => [nome, t.id]))

  // Upsert partidas
  let partidasInseridas = 0
  let idPartidaFake = 10000

  for (const m of matches) {
    const time1 = m.team1
    const time2 = m.team2
    if (!time1 || !time2 || time1.startsWith('W') || time1.startsWith('L') ||
        time2.startsWith('W') || time2.startsWith('L')) {
      // Fase eliminatória sem times definidos — inserir como "a definir"
      const { fase_tipo, fase } = mapRoundOpenFootball(m.round)
      if (fase_tipo === 'grupos') continue

      const partida = {
        id: idPartidaFake++,
        fase,
        fase_tipo,
        data_hora: m.date ? `${m.date}T${converterHora(m.time)}Z` : null,
        selecao_casa_id: null,
        selecao_fora_id: null,
        gols_casa: null,
        gols_fora: null,
        status: 'agendada',
      }
      await admin.from('partidas').upsert(partida, { onConflict: 'id', ignoreDuplicates: true })
      continue
    }

    const casaId = nomeParaId.get(time1)
    const foraId = nomeParaId.get(time2)
    if (!casaId || !foraId) continue

    const { fase_tipo, fase: faseBase } = mapRoundOpenFootball(m.round)
    const grupo = m.group?.replace('Group ', '')
    const fase = fase_tipo === 'grupos' && grupo ? `Grupo ${grupo}` : faseBase

    const partida = {
      id: idPartidaFake++,
      fase,
      fase_tipo,
      data_hora: m.date ? `${m.date}T${converterHora(m.time)}Z` : null,
      selecao_casa_id: casaId,
      selecao_fora_id: foraId,
      gols_casa: null,
      gols_fora: null,
      status: 'agendada',
    }

    await admin.from('partidas').upsert(partida, { onConflict: 'id', ignoreDuplicates: true })
    partidasInseridas++
  }

  return { times: timesMap.size, partidas: partidasInseridas }
}

// Converte "13:00 UTC-6" → "19:00" (UTC)
function converterHora(timeStr: string | undefined): string {
  if (!timeStr) return '18:00:00'
  const match = timeStr.match(/(\d+):(\d+)\s*UTC([+-]\d+)/)
  if (!match) return '18:00:00'
  const h = parseInt(match[1])
  const m = parseInt(match[2])
  const offset = parseInt(match[3])
  const utcH = ((h - offset) + 24) % 24
  return `${String(utcH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function mapRoundOpenFootball(round: string): { fase_tipo: string; fase: string } {
  if (round.startsWith('Matchday'))  return { fase_tipo: 'grupos',   fase: '' }
  if (round === 'Round of 32')       return { fase_tipo: 'rodada32', fase: 'Rodada de 32' }
  if (round === 'Round of 16')       return { fase_tipo: 'oitavas',  fase: 'Oitavas de Final' }
  if (round === 'Quarter-final')     return { fase_tipo: 'quartas',  fase: 'Quartas de Final' }
  if (round === 'Semi-final')        return { fase_tipo: 'semi',     fase: 'Semifinais' }
  if (round === 'Match for third place') return { fase_tipo: 'terceiro', fase: 'Disputa do 3º Lugar' }
  if (round === 'Final')             return { fase_tipo: 'final',    fase: 'Final' }
  return { fase_tipo: 'grupos', fase: round }
}

// ================================================================
// Seed inicial da classificação (times já no banco, 0 pontos)
// ================================================================
async function seedClassificacaoInicial(admin: ReturnType<typeof createAdminClient>) {
  // Busca times que têm grupo definido
  const { data: times } = await admin
    .from('selecoes')
    .select('id, grupo')
    .not('grupo', 'is', null)

  if (!times || times.length === 0) return

  const linhas = times
    .filter(t => t.grupo)
    .map((t, i) => ({
      selecao_id: t.id,
      grupo: t.grupo!,
      posicao: (i % 4) + 1, // posição inicial provisória
      jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
      gols_marcados: 0, gols_sofridos: 0, saldo: 0, pontos: 0,
    }))

  await admin
    .from('classificacao_grupos')
    .upsert(linhas, { onConflict: 'selecao_id', ignoreDuplicates: true })
}

// ================================================================
// WC2026 API — placares ao vivo
// ================================================================
async function sincronizarVivo(admin: ReturnType<typeof createAdminClient>) {
  if (!process.env.WC2026_KEY) return // chave ainda não configurada

  const res = await fetch(`${WC_BASE}/matches?status=live`, { headers: wcHeaders() })
  if (!res.ok) return
  const json = await res.json()
  const partidas: WC2026Match[] = Array.isArray(json) ? json : (json.data ?? [])

  for (const p of partidas) {
    // Busca a partida pelo ID da WC2026 API
    await admin
      .from('partidas')
      .update({
        gols_casa: p.home_score ?? null,
        gols_fora: p.away_score ?? null,
        status: 'ao_vivo',
        minuto: p.minute ?? null,
      })
      .eq('id', p.id)
      .eq('corrigida_manualmente', false)
  }
}

async function sincronizarPartidas(admin: ReturnType<typeof createAdminClient>) {
  if (!process.env.WC2026_KEY) return

  const res = await fetch(`${WC_BASE}/matches`, { headers: wcHeaders() })
  if (!res.ok) throw new Error(`WC2026 API erro: ${res.status}`)
  const json = await res.json()
  const partidas: WC2026Match[] = Array.isArray(json) ? json : (json.data ?? [])

  for (const p of partidas) {
    if (!p.home_team || !p.away_team) continue  // times ainda não definidos (fase eliminatória futura)

    const casaCodigo = codigoDoNome(p.home_team)
    const foraCodigo = codigoDoNome(p.away_team)

    const { data: casaRow } = await admin.from('selecoes').select('id').eq('codigo', casaCodigo).single()
    const { data: foraRow } = await admin.from('selecoes').select('id').eq('codigo', foraCodigo).single()
    if (!casaRow || !foraRow) continue

    const { fase_tipo, fase: faseBase } = mapRoundWC2026(p.round, p.group_name)
    const fase = faseBase

    const statusMapeado = mapStatusWC2026(p.status)

    await admin.from('partidas').upsert({
      id: p.id,
      fase,
      fase_tipo,
      data_hora: p.kickoff_utc,
      selecao_casa_id: casaRow.id,
      selecao_fora_id: foraRow.id,
      gols_casa: p.home_score ?? null,
      gols_fora: p.away_score ?? null,
      status: statusMapeado,
      minuto: p.minute ?? null,
      encerrada: statusMapeado === 'encerrada',
    }, { onConflict: 'id' })
  }
}

async function sincronizarClassificacao(admin: ReturnType<typeof createAdminClient>) {
  if (!process.env.WC2026_KEY) return

  const res = await fetch(`${WC_BASE}/standings`, { headers: wcHeaders() })
  if (!res.ok) return
  const json = await res.json()
  const grupos: WC2026Standing[] = Array.isArray(json) ? json : (json.data ?? [])

  for (const entrada of grupos) {
    const codigo = codigoDoNome(entrada.team)
    const { data: selecao } = await admin.from('selecoes').select('id').eq('codigo', codigo).single()
    if (!selecao) continue

    await admin.from('classificacao_grupos').upsert({
      selecao_id: selecao.id,
      grupo: entrada.group,
      posicao: entrada.position ?? 0,
      jogos: entrada.played ?? 0,
      vitorias: entrada.won ?? 0,
      empates: entrada.drawn ?? 0,
      derrotas: entrada.lost ?? 0,
      gols_marcados: entrada.goals_for ?? 0,
      gols_sofridos: entrada.goals_against ?? 0,
      saldo: entrada.goal_difference ?? 0,
      pontos: entrada.points ?? 0,
    }, { onConflict: 'selecao_id' })
  }
}

function mapRoundWC2026(round: string, group?: string): { fase_tipo: string; fase: string } {
  if (round === 'group' && group) return { fase_tipo: 'grupos', fase: `Grupo ${group}` }
  if (round === 'round_of_32') return { fase_tipo: 'rodada32', fase: 'Rodada de 32' }
  if (round === 'round_of_16') return { fase_tipo: 'oitavas',  fase: 'Oitavas de Final' }
  if (round === 'quarter_final') return { fase_tipo: 'quartas', fase: 'Quartas de Final' }
  if (round === 'semi_final')   return { fase_tipo: 'semi',    fase: 'Semifinais' }
  if (round === 'third_place')  return { fase_tipo: 'terceiro', fase: 'Disputa do 3º Lugar' }
  if (round === 'final')        return { fase_tipo: 'final',   fase: 'Final' }
  return { fase_tipo: 'grupos', fase: round }
}

function mapStatusWC2026(status: string): 'agendada' | 'ao_vivo' | 'encerrada' {
  if (status === 'live')    return 'ao_vivo'
  if (status === 'finished' || status === 'completed') return 'encerrada'
  return 'agendada'
}


// ----------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------
type OpenFootballMatch = {
  round: string
  date?: string
  time?: string
  group?: string
  team1?: string
  team2?: string
  num?: number
}

type WC2026Match = {
  id: number
  round: string
  group_name?: string
  home_team: string
  away_team: string
  kickoff_utc: string
  status: string
  home_score?: number | null
  away_score?: number | null
  minute?: number | null
  home_penalties?: number | null
  away_penalties?: number | null
}

type WC2026Standing = {
  team: string
  group: string
  position?: number
  played?: number
  won?: number
  drawn?: number
  lost?: number
  goals_for?: number
  goals_against?: number
  goal_difference?: number
  points?: number
}
