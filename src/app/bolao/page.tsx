import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormCriarGrupo from '@/components/FormCriarGrupo'
import FormEntrarGrupo from '@/components/FormEntrarGrupo'

export default async function BolaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Buscar grupos do usuário
  const { data: membros } = await supabase
    .from('membros_grupo')
    .select('grupo_id, grupos_bolao(id, nome, codigo_convite)')
    .eq('user_id', user.id)

  type GrupoInfo = { id: string; nome: string; codigo_convite: string }
  const grupos: GrupoInfo[] = (membros ?? [])
    .flatMap(m => (Array.isArray(m.grupos_bolao) ? m.grupos_bolao : m.grupos_bolao ? [m.grupos_bolao] : []))
    .filter(Boolean) as GrupoInfo[]

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Início
          </Link>
          <h1 className="text-xl font-black text-[var(--copa-gold)] tracking-tight">
            Copa 2026 do Cecone
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Bolão</h2>
        <p className="text-white/40 text-sm mb-8">
          Olá, {user.user_metadata.full_name ?? user.email}
        </p>

        {/* Grupos existentes */}
        {grupos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm text-white/40 uppercase tracking-wider font-semibold mb-3">
              Seus grupos
            </h3>
            <div className="flex flex-col gap-2">
              {grupos.map(g => (
                <Link
                  key={g.id}
                  href={`/bolao/${g.id}`}
                  className="flex items-center justify-between bg-[var(--surface)] rounded-xl px-4 py-4 border border-white/10 hover:border-[var(--copa-gold)]/40 transition-all"
                >
                  <div>
                    <p className="text-white font-semibold">{g.nome}</p>
                    <p className="text-white/30 text-xs font-mono mt-0.5">Código: {g.codigo_convite}</p>
                  </div>
                  <span className="text-white/30 text-lg">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Criar grupo */}
        <div className="bg-[var(--surface)] rounded-xl p-5 border border-white/10 mb-4">
          <h3 className="text-white font-bold mb-1">Criar novo grupo</h3>
          <p className="text-white/40 text-sm mb-4">Você receberá um código para convidar seus amigos.</p>
          <FormCriarGrupo />
        </div>

        {/* Entrar em grupo */}
        <div className="bg-[var(--surface)] rounded-xl p-5 border border-white/10">
          <h3 className="text-white font-bold mb-1">Entrar em um grupo</h3>
          <p className="text-white/40 text-sm mb-4">Use o código de convite que você recebeu.</p>
          <FormEntrarGrupo />
        </div>
      </div>
    </div>
  )
}
