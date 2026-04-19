'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

function gerarCodigo() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function criarGrupo(nome: string) {
  const user = await getUser()
  if (!user) return { erro: 'Você precisa estar logado.' }

  const admin = createAdminClient()
  const codigo = gerarCodigo()

  const { data: grupo, error } = await admin
    .from('grupos_bolao')
    .insert({ nome, codigo_convite: codigo, criado_por: user.id })
    .select()
    .single()

  if (error) return { erro: `Erro ao criar grupo: ${error.message}` }

  await admin.from('membros_grupo').insert({ grupo_id: grupo.id, user_id: user.id })

  revalidatePath('/bolao')
  return { grupo }
}

export async function entrarGrupo(codigo: string) {
  const user = await getUser()
  if (!user) return { erro: 'Você precisa estar logado.' }

  const admin = createAdminClient()

  const { data: grupo, error } = await admin
    .from('grupos_bolao')
    .select()
    .eq('codigo_convite', codigo.toUpperCase())
    .single()

  if (error || !grupo) return { erro: 'Código inválido. Verifique e tente novamente.' }

  const { error: erroMembro } = await admin
    .from('membros_grupo')
    .insert({ grupo_id: grupo.id, user_id: user.id })

  if (erroMembro?.code === '23505') return { erro: 'Você já está neste grupo.' }
  if (erroMembro) return { erro: 'Erro ao entrar no grupo.' }

  revalidatePath('/bolao')
  return { grupo }
}

export async function salvarPalpite(
  grupoId: string,
  partidaId: number,
  golsCasa: number,
  golsFora: number
) {
  const user = await getUser()
  if (!user) return { erro: 'Você precisa estar logado.' }

  const admin = createAdminClient()

  const { error } = await admin.from('palpites').upsert(
    { user_id: user.id, grupo_id: grupoId, partida_id: partidaId, gols_casa: golsCasa, gols_fora: golsFora },
    { onConflict: 'user_id,grupo_id,partida_id' }
  )

  if (error) {
    console.error('[salvarPalpite]', error)
    return { erro: `Erro ao salvar palpite: ${error.message}` }
  }

  revalidatePath(`/bolao/${grupoId}`)
  return { ok: true }
}

export async function salvarPalpiteEspecial(
  grupoId: string,
  campeaoId: number,
  artilheiroId: number
) {
  const user = await getUser()
  if (!user) return { erro: 'Você precisa estar logado.' }

  const admin = createAdminClient()

  const { error } = await admin.from('palpites_especiais').upsert(
    { user_id: user.id, grupo_id: grupoId, campeao_id: campeaoId, artilheiro_id: artilheiroId },
    { onConflict: 'user_id,grupo_id' }
  )

  if (error) {
    console.error('[salvarPalpiteEspecial]', error)
    return { erro: `Erro ao salvar palpite especial: ${error.message}` }
  }

  revalidatePath(`/bolao/${grupoId}`)
  return { ok: true }
}
