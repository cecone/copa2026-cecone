import { verificarAdmin, logoutAdmin } from './actions'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import FormEditarPartida from '@/components/FormEditarPartida'

export default async function AdminPage() {
  const autenticado = await verificarAdmin()
  if (!autenticado) redirect('/admin/login')

  const admin = createAdminClient()
  const { data: partidas } = await admin
    .from('partidas')
    .select(`
      id, fase, data_hora, gols_casa, gols_fora, encerrada, corrigida_manualmente,
      selecao_casa:selecao_casa_id(nome, bandeira_url, codigo),
      selecao_fora:selecao_fora_id(nome, bandeira_url, codigo)
    `)
    .order('data_hora', { ascending: true })

  async function handleLogout() {
    'use server'
    await logoutAdmin()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-black text-[var(--copa-gold)]">
            Admin — Copa 2026
          </h1>
          <form action={handleLogout}>
            <button type="submit" className="text-sm text-white/40 hover:text-white transition-colors">
              Sair
            </button>
          </form>
        </div>

        <h2 className="text-lg font-bold text-white mb-2">Editar Partidas</h2>
        <p className="text-white/40 text-sm mb-6">
          Corrija resultados manualmente quando a API falhar. Partidas marcadas com ✎ já foram editadas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(partidas ?? []).map(p => (
            <FormEditarPartida key={p.id} partida={p as any} />
          ))}
        </div>
      </div>
    </div>
  )
}
