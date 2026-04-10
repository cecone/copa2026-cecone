import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import FormPalpite from '@/components/FormPalpite'
import { partidasMock } from '@/lib/dados-mock'

type Props = {
  params: Promise<{ id: string }>
}

export default async function GrupoBolaoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Buscar grupo
  const { data: grupo } = await supabase
    .from('grupos_bolao')
    .select('*')
    .eq('id', id)
    .single()

  if (!grupo) notFound()

  // Verificar se é membro
  const { data: membro } = await supabase
    .from('membros_grupo')
    .select('id')
    .eq('grupo_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membro) redirect('/bolao')

  // Buscar membros do grupo
  const { data: membros } = await supabase
    .from('membros_grupo')
    .select('user_id')
    .eq('grupo_id', id)

  // Buscar palpites do usuário neste grupo
  const { data: meusPalpites } = await supabase
    .from('palpites')
    .select('partida_id, gols_casa, gols_fora')
    .eq('grupo_id', id)
    .eq('user_id', user.id)

  const palpitePorPartida = Object.fromEntries(
    (meusPalpites ?? []).map(p => [p.partida_id, p])
  )

  // Calcular ranking simples (pontos baseados nos palpites)
  const { data: todosPalpites } = await supabase
    .from('palpites')
    .select('user_id, partida_id, gols_casa, gols_fora')
    .eq('grupo_id', id)

  const ranking = calcularRanking(membros ?? [], todosPalpites ?? [])

  // Partidas disponíveis para palpite (só fase de grupos por agora)
  const partidasGrupos = partidasMock

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/bolao" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Bolão
          </Link>
          <h1 className="text-xl font-black text-[var(--copa-gold)] tracking-tight">
            Copa 2026 do Cecone
          </h1>
        </div>

        {/* Nome do grupo */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">{grupo.nome}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/30 text-sm">Código de convite:</span>
            <span className="font-mono font-bold text-[var(--copa-gold)] tracking-widest bg-[var(--surface)] px-2 py-0.5 rounded text-sm">
              {grupo.codigo_convite}
            </span>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-[var(--surface)] rounded-xl border border-white/10 mb-8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Ranking</h3>
          </div>
          {ranking.length === 0 ? (
            <p className="text-white/30 text-sm p-4">Nenhum palpite registrado ainda.</p>
          ) : (
            ranking.map((r, i) => (
              <div
                key={r.userId}
                className={`flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 ${r.userId === user.id ? 'bg-[var(--copa-blue)]/10' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-[var(--copa-gold)]' : 'text-white/30'}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/70">
                    {r.userId === user.id ? `${user.user_metadata.full_name ?? 'Você'} (você)` : `Participante`}
                  </span>
                </div>
                <span className="font-bold text-white">{r.pontos} pts</span>
              </div>
            ))
          )}
        </div>

        {/* Palpites */}
        <h3 className="text-lg font-bold text-white mb-4">Seus Palpites</h3>
        <div className="flex flex-col gap-3">
          {partidasGrupos.map(partida => (
            <FormPalpite
              key={partida.id}
              partida={partida}
              grupoId={id}
              palpiteAtual={palpitePorPartida[partida.id] ?? null}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function calcularRanking(
  membros: { user_id: string }[],
  palpites: { user_id: string; partida_id: number; gols_casa: number; gols_fora: number }[]
) {
  return membros
    .map(m => {
      const meusPalpites = palpites.filter(p => p.user_id === m.user_id)
      const pontos = meusPalpites.reduce((acc, p) => {
        const partida = partidasMock.find(pa => pa.id === p.partida_id)
        if (!partida || partida.status !== 'encerrada') return acc
        if (partida.gols_casa === null || partida.gols_fora === null) return acc

        const acertouPlacar = p.gols_casa === partida.gols_casa && p.gols_fora === partida.gols_fora
        if (acertouPlacar) return acc + 7

        const resultadoReal = Math.sign(partida.gols_casa - partida.gols_fora)
        const resultadoPalpite = Math.sign(p.gols_casa - p.gols_fora)
        if (resultadoReal === resultadoPalpite) return acc + 3

        return acc
      }, 0)
      return { userId: m.user_id, pontos }
    })
    .sort((a, b) => b.pontos - a.pontos)
}
