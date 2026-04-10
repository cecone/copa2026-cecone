'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BotaoLogout() {
  const supabase = createClient()
  const router = useRouter()

  async function sair() {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={sair}
      className="text-sm text-[var(--foreground)] opacity-60 hover:opacity-100 transition-opacity"
    >
      Sair
    </button>
  )
}
