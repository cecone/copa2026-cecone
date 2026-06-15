import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase-server'
import TabelaGrupo from '@/components/TabelaGrupo'
import { Grupo } from '@/types'
import Link from 'next/link'

export const revalidate = 60 // revalida a cada 60 segundos

export default async function GruposPage() {
  const supabase = await createClient()

  // ── DADOS: idêntico ao seu, nada mudou aqui ──
  const { data: linhas } = await supabase
    .from('classificacao_grupos')
    .select(`
      grupo, posicao, jogos, vitorias, empates, derrotas,
      gols_marcados, gols_sofridos, saldo, pontos,
      selecao:selecao_id(id, nome, codigo, bandeira)
    `)
    .order('grupo', { ascending: true })
    .order('posicao', { ascending: true })

  const mapaGrupos = new Map<string, Grupo>()

  for (const linha of linhas ?? []) {
    const sel = Array.isArray(linha.selecao) ? linha.selecao[0] : linha.selecao
    if (!sel) continue

    if (!mapaGrupos.has(linha.grupo)) {
      mapaGrupos.set(linha.grupo, { nome: linha.grupo, times: [] })
    }

    mapaGrupos.get(linha.grupo)!.times.push({
      selecao: { id: sel.id, nome: sel.nome, codigo: sel.codigo, bandeira: sel.bandeira },
      jogos: linha.jogos,
      vitorias: linha.vitorias,
      empates: linha.empates,
      derrotas: linha.derrotas,
      gols_marcados: linha.gols_marcados,
      gols_sofridos: linha.gols_sofridos,
      saldo: linha.saldo,
      pontos: linha.pontos,
    })
  }

  const grupos = Array.from(mapaGrupos.values()).sort((a, b) => a.nome.localeCompare(b.nome))

  // ── VISUAL: o que foi melhorado ──
  return (
    <div className="min-h-screen px-4 pb-16 pt-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Topo */}
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--mist)] transition-colors hover:text-[var(--chalk)]"
          >
            <span aria-hidden>←</span> Início
          </Link>
          <LogoApp horizontal />
        </header>

        {/* Título com eyebrow + display condensado */}
        <div className="mb-7">
          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-[var(--mist)]">
            Copa do Mundo 2026
          </p>
          <h1 className="font-display text-4xl font-bold uppercase text-[var(--chalk)]">
            Fase de grupos
          </h1>
        </div>

        {/* Estado vazio = convite, não desculpa */}
        {grupos.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--turf)] py-16 text-center">
            <p className="mb-3 text-3xl">📊</p>
            <p className="font-display text-xl uppercase text-[var(--chalk)]">
              Classificação a caminho
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--mist)]">
              As tabelas aparecem aqui assim que a primeira rodada for sincronizada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {grupos.map(grupo => (
              <TabelaGrupo key={grupo.nome} grupo={grupo} />
            ))}
          </div>
        )}

        {/* Legenda enxuta */}
        <p className="mt-8 text-center text-xs text-[var(--mist)]">
          J = Jogos · SG = Saldo de gols · Pts = Pontos ·{' '}
          <span className="text-[var(--copa-gold)]">●</span> classificados
        </p>
      </div>
    </div>
  )
}
