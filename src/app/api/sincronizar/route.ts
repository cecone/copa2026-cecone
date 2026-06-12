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
    if (tipo === 'debug') {
      const urls = [
        `${WC_BASE}/matches?status=live`,
        `${WC_BASE}/matches?status=finished`,
        `${WC_BASE}/matches/today`,
        `${WC_BASE}/matches`,
      ]
      const resultados: Record<string, unknown> = {}
      for (const url of urls) {
        const res = await fetch(url, { headers: wcHeaders() })
        const texto = await res.text()
        try { resultados[url] = { status: res.status, body: JSON.parse(texto) } }
        catch { resultados[url] = { status: res.status, body: texto } }
      }
      return NextResponse.json(resultados)
    }

    if (tipo === 'sementes') {
      // Seed inicial a partir do openfootball (sem chave de API)
      const resultado = await seedDeOpenFootball(admin)
      // Popular classificação inicial usando as seleções do seed atual
      await seedClassificacaoInicial(admin, resultado.selecoes)
      return NextResponse.json({ ok: true, tipo: 'sementes', ...resultado })
    }

    if (tipo === 'vivo') {
      const resultado = await sincronizarVivo(admin)
      return NextResponse.json({ ok: true, tipo: 'vivo', ...resultado })
    }

    if (tipo === 'partidas' || tipo === 'tudo') {
      await sincronizarPartidas(admin)
    }

    if (tipo === 'classificacao' || tipo === 'tudo') {
      await sincronizarClassificacao(admin)
    }

    // Retorna uso atual do rate limit para diagnóstico
    const { count, proximoEm } = await getRateState(admin)
    return NextResponse.json({ ok: true, tipo, requisicoes_hoje: count, proximo_sync: proximoEm })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[sincronizar]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

// ================================================================
// ID estável para seleções: usa ASCII direto sem normalização.
// BRA → 66*10000 + 82*100 + 65 = 668265. Range: 656565–909090.
// Matematicamente impossível colidir para qualquer par de códigos A-Z distintos.
function codigoParaId(codigo: string): number {
  const s = ((codigo ?? '').toUpperCase().replace(/[^A-Z]/g, '') + 'AAA').slice(0, 3)
  return s.charCodeAt(0) * 10000 + s.charCodeAt(1) * 100 + s.charCodeAt(2)
}

// ID estável para partidas: hash da string data+times.
// Range grande (10000–909999) para minimizar colisões entre ~150 jogos.
function hashPartidaId(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return (Math.abs(h) % 900000) + 10000
}

// ================================================================
// SEED: openfootball (calendário completo, sem chave)
// ================================================================
async function seedDeOpenFootball(admin: ReturnType<typeof createAdminClient>) {
  const res = await fetch(OPENFOOTBALL_URL)
  if (!res.ok) throw new Error('Falha ao buscar dados do openfootball')
  const json = await res.json()

  const matches: OpenFootballMatch[] = json.matches ?? []

  // Indexar por CÓDIGO FIFA (não por nome) — evita duplicatas quando o mesmo
  // time aparece com nomes diferentes (ex: "USA" e "United States")
  const codigoMap = new Map<string, { id: number; nome: string; codigo: string; grupo: string | null }>()
  // Mapa auxiliar: nome original → id (para montar as FKs das partidas)
  const nomeParaId = new Map<string, number>()

  for (const m of matches) {
    const time1 = m.team1
    const time2 = m.team2
    if (!time1 || time1.startsWith('W') || time1.startsWith('L') || /^\d/.test(time1)) continue
    if (!time2 || time2.startsWith('W') || time2.startsWith('L') || /^\d/.test(time2)) continue

    for (const nome of [time1, time2]) {
      const codigo = codigoDoNome(nome)
      const id = codigoParaId(codigo)
      nomeParaId.set(nome, id)

      if (!codigoMap.has(codigo)) {
        const grupo = m.group?.replace('Group ', '') ?? null
        codigoMap.set(codigo, { id, nome: nomePtBr(nome), codigo, grupo })
      } else if (m.group && !codigoMap.get(codigo)!.grupo) {
        codigoMap.get(codigo)!.grupo = m.group.replace('Group ', '')
      }
    }
  }

  const selecoes = Array.from(codigoMap.values()).map(t => ({
    id: t.id,
    nome: t.nome,
    codigo: t.codigo,
    bandeira: emojiBandeira(t.codigo),
    bandeira_url: urlBandeira(t.codigo),
    grupo: t.grupo,
  }))

  // Limpeza na ordem correta (respeita dependências de FK):
  // 1. partidas → 2. classificacao_grupos → 3. seleções
  // Deletar partidas e classificação (sem dados de usuário, seguro remover)
  // Não deletamos seleções pois palpites_especiais tem FK para elas
  const { error: e1 } = await admin
    .from('partidas')
    .delete()
    .neq('corrigida_manualmente', true)
  if (e1) throw new Error(`Erro ao apagar partidas: ${e1.message}`)

  const { error: e2 } = await admin
    .from('classificacao_grupos')
    .delete()
    .gte('selecao_id', 1)
  if (e2) throw new Error(`Erro ao apagar classificação: ${e2.message}`)

  // Verificar duplicatas de ID antes do upsert para diagnóstico claro
  const seenIds = new Map<number, string>()
  for (const s of selecoes) {
    if (seenIds.has(s.id)) {
      throw new Error(`ID duplicado: "${s.codigo}" e "${seenIds.get(s.id)}" → id=${s.id}`)
    }
    seenIds.set(s.id, s.codigo)
  }

  const { error: errSelecoes } = await admin
    .from('selecoes')
    .upsert(selecoes, { onConflict: 'id' })
  if (errSelecoes) throw new Error(`Erro ao inserir seleções: ${errSelecoes.message}`)

  // Inserir partidas com IDs estáveis
  let partidasInseridas = 0

  for (const m of matches) {
    const time1 = m.team1
    const time2 = m.team2
    if (!time1 || !time2 || time1.startsWith('W') || time1.startsWith('L') || /^\d/.test(time1) ||
        time2.startsWith('W') || time2.startsWith('L') || /^\d/.test(time2)) {
      // Fase eliminatória sem times definidos — inserir como "a definir"
      const { fase_tipo, fase } = mapRoundOpenFootball(m.round)
      if (fase_tipo === 'grupos') continue

      const partida = {
        id: hashPartidaId(`${m.date ?? ''}|${m.round}|${m.num ?? ''}`),
        fase,
        fase_tipo,
        data_hora: m.date ? converterDataHora(m.date, m.time) : null,
        selecao_casa_id: null,
        selecao_fora_id: null,
        gols_casa: null,
        gols_fora: null,
        status: 'agendada',
      }
      await admin.from('partidas').insert(partida)
      continue
    }

    const casaId = nomeParaId.get(time1)
    const foraId = nomeParaId.get(time2)
    if (!casaId || !foraId) continue

    const { fase_tipo, fase: faseBase } = mapRoundOpenFootball(m.round)
    const grupo = m.group?.replace('Group ', '')
    const fase = fase_tipo === 'grupos' && grupo ? `Grupo ${grupo}` : faseBase

    const partida = {
      id: hashPartidaId(`${m.date ?? ''}|${time1}|${time2}`),
      fase,
      fase_tipo,
      data_hora: m.date ? converterDataHora(m.date, m.time) : null,
      selecao_casa_id: casaId,
      selecao_fora_id: foraId,
      gols_casa: null,
      gols_fora: null,
      status: 'agendada',
    }

    await admin.from('partidas').insert(partida)
    partidasInseridas++
  }

  return { times: codigoMap.size, partidas: partidasInseridas, selecoes }
}

// Converte data + hora local ("2026-06-11", "20:00 UTC-6") para ISO UTC correto.
// Trata overflow de meia-noite: "20:00 UTC-6" no dia 11 → "2026-06-12T02:00:00Z".
function converterDataHora(dateStr: string, timeStr: string | undefined): string {
  if (!timeStr) return `${dateStr}T18:00:00Z`
  const match = timeStr.match(/(\d+):(\d+)\s*UTC([+-]\d+)/)
  if (!match) return `${dateStr}T18:00:00Z`
  const localMin = parseInt(match[1]) * 60 + parseInt(match[2])
  const offsetMin = parseInt(match[3]) * 60  // negativo para UTC-X
  const utcMin = localMin - offsetMin         // UTC = local + |offset|
  const base = new Date(`${dateStr}T00:00:00Z`)
  base.setUTCMinutes(base.getUTCMinutes() + utcMin)
  return base.toISOString().slice(0, 19) + 'Z'
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
// Seed inicial da classificação (usa seleções do seed atual, não do banco)
// ================================================================
async function seedClassificacaoInicial(
  admin: ReturnType<typeof createAdminClient>,
  selecoes: { id: number; grupo: string | null }[]
) {
  const linhas = selecoes
    .filter(t => t.grupo)
    .map((t, i) => ({
      selecao_id: t.id,
      grupo: t.grupo!,
      posicao: (i % 4) + 1,
      jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
      gols_marcados: 0, gols_sofridos: 0, saldo: 0, pontos: 0,
    }))

  if (linhas.length === 0) return

  await admin
    .from('classificacao_grupos')
    .upsert(linhas, { onConflict: 'selecao_id', ignoreDuplicates: true })
}

// ================================================================
// Rate limit — persiste estado no Supabase (funções serverless são stateless)
// Limite: 100 req/dia. Travamos em 90 para deixar margem.
// ================================================================
const LIMITE_DIARIO = 90
const COOLDOWN_PADRAO_S = 10 * 60 // 10 minutos se a API não informar next_phase_in_seconds

async function getRateState(admin: ReturnType<typeof createAdminClient>) {
  const hoje = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
  const { data } = await admin
    .from('configuracoes')
    .select('chave, valor')
    .in('chave', ['wc_req_date', 'wc_req_count', 'wc_proximo_em'])

  const estado = Object.fromEntries((data ?? []).map(r => [r.chave, r.valor]))
  const count = estado.wc_req_date === hoje ? parseInt(estado.wc_req_count ?? '0') : 0
  const proximoEm = estado.wc_proximo_em ? new Date(estado.wc_proximo_em) : null

  return { hoje, count, proximoEm }
}

async function registrarRequisicao(
  admin: ReturnType<typeof createAdminClient>,
  hoje: string,
  count: number,
  nextPhaseSeconds?: number | null,
) {
  const cooldown = nextPhaseSeconds ?? COOLDOWN_PADRAO_S
  const proximoEm = new Date(Date.now() + cooldown * 1000).toISOString()
  await admin.from('configuracoes').upsert([
    { chave: 'wc_req_date',  valor: hoje },
    { chave: 'wc_req_count', valor: String(count + 1) },
    { chave: 'wc_proximo_em', valor: proximoEm },
  ], { onConflict: 'chave' })
}

// Retorna { permitido, count, proximoEm, motivo? }
async function verificarRateLimit(admin: ReturnType<typeof createAdminClient>) {
  const { hoje, count, proximoEm } = await getRateState(admin)

  if (count >= LIMITE_DIARIO) {
    return { permitido: false, hoje, count, proximoEm, motivo: `limite_diario (${count}/${LIMITE_DIARIO})` }
  }
  if (proximoEm && proximoEm > new Date()) {
    const esperaS = Math.ceil((proximoEm.getTime() - Date.now()) / 1000)
    return { permitido: false, hoje, count, proximoEm, motivo: `cooldown (${esperaS}s restantes)` }
  }

  return { permitido: true, hoje, count, proximoEm }
}

// ================================================================
// WC2026 API — placares ao vivo
// ================================================================
async function sincronizarVivo(admin: ReturnType<typeof createAdminClient>) {
  if (!process.env.WC2026_KEY) return

  const limite = await verificarRateLimit(admin)
  if (!limite.permitido) {
    console.log(`[sincronizar/vivo] pulado — ${limite.motivo}`)
    return { pulado: true, motivo: limite.motivo, requisicoes_hoje: limite.count }
  }

  const res = await fetch(`${WC_BASE}/matches`, { headers: wcHeaders() })
  if (!res.ok) return

  const json = await res.json()
  const todasPartidas: WC2026Match[] = Array.isArray(json) ? json : (json.data ?? [])
  const nextPhaseSeconds: number | null = json.next_phase_in_seconds ?? null

  // Atualizar apenas partidas ao vivo ou recém-encerradas
  const partidas = todasPartidas.filter(p => p.status === 'live' || p.status === 'finished' || p.status === 'completed')

  await registrarRequisicao(admin, limite.hoje, limite.count, nextPhaseSeconds)

  for (const p of partidas) {
    if (!p.home_team || !p.away_team) continue

    const casaCodigo = p.home_team_code ?? codigoDoNome(p.home_team)
    const foraCodigo = p.away_team_code ?? codigoDoNome(p.away_team)

    const { data: casaRows } = await admin.from('selecoes').select('id').eq('codigo', casaCodigo)
    const { data: foraRows } = await admin.from('selecoes').select('id').eq('codigo', foraCodigo)
    if (!casaRows?.length || !foraRows?.length) continue

    const casaIds = casaRows.map(r => r.id)
    const foraIds = foraRows.map(r => r.id)

    await admin
      .from('partidas')
      .update({
        gols_casa: p.home_score ?? null,
        gols_fora: p.away_score ?? null,
        status: mapStatusWC2026(p.status),
        minuto: p.minute ?? null,
      })
      .in('selecao_casa_id', casaIds)
      .in('selecao_fora_id', foraIds)
      .eq('corrigida_manualmente', false)
  }

  // Recalcular classificação a partir das partidas encerradas no banco (sem custo de API)
  await recalcularClassificacao(admin)

  return { pulado: false, requisicoes_hoje: limite.count + 1, proximo_em_s: nextPhaseSeconds }
}

// ================================================================
// Recalcula classificação_grupos a partir das partidas encerradas no banco.
// Não consome cota da API externa.
// ================================================================
async function recalcularClassificacao(admin: ReturnType<typeof createAdminClient>) {
  const { data: partidas } = await admin
    .from('partidas')
    .select('fase, selecao_casa_id, selecao_fora_id, gols_casa, gols_fora')
    .eq('fase_tipo', 'grupos')
    .eq('status', 'encerrada')

  if (!partidas?.length) return

  // Buscar todas as seleções dos grupos para montar o mapa id→grupo
  const { data: selecoes } = await admin
    .from('selecoes')
    .select('id, grupo')
    .not('grupo', 'is', null)

  // Como há 3 ids por seleção, usar o id que está nas partidas como chave
  // O grupo vem da tabela selecoes — pegar o primeiro valor encontrado por id
  const grupoPorid = new Map<number, string>()
  for (const s of selecoes ?? []) {
    if (!grupoPorid.has(s.id)) grupoPorid.set(s.id, s.grupo)
  }

  // Acumular stats por selecao_id
  type Stats = { grupo: string; jogos: number; vitorias: number; empates: number; derrotas: number; gm: number; gs: number }
  const stats = new Map<number, Stats>()

  function get(id: number, grupo: string): Stats {
    if (!stats.has(id)) stats.set(id, { grupo, jogos: 0, vitorias: 0, empates: 0, derrotas: 0, gm: 0, gs: 0 })
    return stats.get(id)!
  }

  for (const p of partidas) {
    if (p.gols_casa === null || p.gols_fora === null) continue
    const gc = p.gols_casa, gf = p.gols_fora
    const grupoCasa = grupoPorid.get(p.selecao_casa_id) ?? ''
    const grupoFora = grupoPorid.get(p.selecao_fora_id) ?? ''

    const casa = get(p.selecao_casa_id, grupoCasa)
    const fora = get(p.selecao_fora_id, grupoFora)

    casa.jogos++; fora.jogos++
    casa.gm += gc; casa.gs += gf
    fora.gm += gf; fora.gs += gc

    if (gc > gf)      { casa.vitorias++; fora.derrotas++ }
    else if (gc < gf) { fora.vitorias++; casa.derrotas++ }
    else              { casa.empates++;  fora.empates++ }
  }

  // Calcular posição por grupo
  const porGrupo = new Map<string, { id: number; s: Stats }[]>()
  for (const [id, s] of stats) {
    if (!porGrupo.has(s.grupo)) porGrupo.set(s.grupo, [])
    porGrupo.get(s.grupo)!.push({ id, s })
  }

  const linhas: { selecao_id: number; grupo: string; posicao: number; jogos: number; vitorias: number; empates: number; derrotas: number; gols_marcados: number; gols_sofridos: number; saldo: number; pontos: number }[] = []
  for (const times of porGrupo.values()) {
    times.sort((a, b) => {
      const ptA = a.s.vitorias * 3 + a.s.empates
      const ptB = b.s.vitorias * 3 + b.s.empates
      if (ptB !== ptA) return ptB - ptA
      return (b.s.gm - b.s.gs) - (a.s.gm - a.s.gs)
    })
    times.forEach(({ id, s }, i) => {
      linhas.push({
        selecao_id: id,
        grupo: s.grupo,
        posicao: i + 1,
        jogos: s.jogos,
        vitorias: s.vitorias,
        empates: s.empates,
        derrotas: s.derrotas,
        gols_marcados: s.gm,
        gols_sofridos: s.gs,
        saldo: s.gm - s.gs,
        pontos: s.vitorias * 3 + s.empates,
      })
    })
  }

  if (linhas.length > 0) {
    await admin.from('classificacao_grupos').upsert(linhas, { onConflict: 'selecao_id' })
  }
}

async function sincronizarPartidas(admin: ReturnType<typeof createAdminClient>) {
  if (!process.env.WC2026_KEY) return

  const limite = await verificarRateLimit(admin)
  if (!limite.permitido) {
    console.log(`[sincronizar/partidas] pulado — ${limite.motivo}`)
    return
  }

  const res = await fetch(`${WC_BASE}/matches`, { headers: wcHeaders() })
  if (!res.ok) throw new Error(`WC2026 API erro: ${res.status}`)
  const json = await res.json()
  const partidas: WC2026Match[] = Array.isArray(json) ? json : (json.data ?? [])
  const nextPhaseSeconds: number | null = json.next_phase_in_seconds ?? null

  await registrarRequisicao(admin, limite.hoje, limite.count, nextPhaseSeconds)

  for (const p of partidas) {
    if (!p.home_team || !p.away_team) continue

    const casaCodigo = p.home_team_code ?? codigoDoNome(p.home_team)
    const foraCodigo = p.away_team_code ?? codigoDoNome(p.away_team)

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

  const limite = await verificarRateLimit(admin)
  if (!limite.permitido) {
    console.log(`[sincronizar/classificacao] pulado — ${limite.motivo}`)
    return
  }

  const res = await fetch(`${WC_BASE}/standings`, { headers: wcHeaders() })
  if (!res.ok) return
  const json = await res.json()
  const grupos: WC2026Standing[] = Array.isArray(json) ? json : (json.data ?? [])
  const nextPhaseSeconds: number | null = json.next_phase_in_seconds ?? null

  await registrarRequisicao(admin, limite.hoje, limite.count, nextPhaseSeconds)

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
  home_team_code?: string | null
  away_team: string
  away_team_code?: string | null
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
