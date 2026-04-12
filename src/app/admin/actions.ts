'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { createHmac } from 'crypto'

function gerarToken(usuario: string) {
  return createHmac('sha256', process.env.ADMIN_SECRET!)
    .update(usuario)
    .digest('hex')
}

export async function loginAdmin(usuario: string, senha: string) {
  if (
    usuario !== process.env.ADMIN_USERNAME ||
    senha !== process.env.ADMIN_PASSWORD
  ) {
    return { erro: 'Usuário ou senha incorretos.' }
  }

  const token = gerarToken(usuario)
  const cookieStore = await cookies()
  cookieStore.set('copa_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })

  return { ok: true }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('copa_admin')
}

export async function verificarAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('copa_admin')?.value
  if (!token) return false
  return token === gerarToken(process.env.ADMIN_USERNAME!)
}

export async function atualizarPartida(
  partidaId: number,
  golsCasa: number | null,
  golsFora: number | null,
  encerrada: boolean
) {
  const autenticado = await verificarAdmin()
  if (!autenticado) return { erro: 'Não autorizado.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('partidas')
    .update({
      gols_casa: golsCasa,
      gols_fora: golsFora,
      encerrada,
      corrigida_manualmente: true,
    })
    .eq('id', partidaId)

  if (error) return { erro: `Erro ao atualizar: ${error.message}` }

  revalidatePath('/admin')
  revalidatePath('/partidas')
  revalidatePath('/grupos')
  return { ok: true }
}
