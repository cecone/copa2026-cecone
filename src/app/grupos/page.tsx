import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase-server'
import TabelaGrupo from '@/components/TabelaGrupo'
import { Grupo } from '@/types'
import Link from 'next/link'

export const revalidate = 60 // revalida a cada 60 segundos

export default async function GruposPage() {
  const supabase = await createClient()

  const { data: linhas } = await supabase
    .from('classificacao_grupos')
    .select(`
      grupo, posicao, jogos, vitorias, empates, derrotas,
      gols_marcados, gols_sofridos, saldo, pontos,
      selecao:selecao_id(id, nome, codigo, bandeira)
    `)
    .order('grupo', { ascending: true })
    .order('posicao', { ascending: true })

  // Agrupar linhas por grupo
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

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Início
          </Link>
          <LogoApp horizontal />
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Fase de Grupos</h2>

        {grupos.length === 0 ? (
          <p className="text-white/40 text-center py-16">
            Os dados da classificação ainda não foram carregados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grupos.map(grupo => (
              <TabelaGrupo key={grupo.nome} grupo={grupo} />
            ))}
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-8">
          J = Jogos · V = Vitórias · E = Empates · D = Derrotas · SG = Saldo de Gols · Pts = Pontos
        </p>
      </div>
    </div>
  )
}
