import { createClient } from '@/lib/supabase-server'
import BotaoLogin from '@/components/BotaoLogin'
import BotaoLogout from '@/components/BotaoLogout'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-4xl font-bold text-[var(--copa-gold)] text-center">
        Copa 2026 do Cecone
      </h1>
      <p className="text-lg text-center opacity-70">
        Tabela ao vivo e bolão da Copa do Mundo 2026
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/grupos"
          className="bg-[var(--copa-blue)] text-white font-bold px-6 py-3 rounded-full text-center hover:brightness-110 transition-all"
        >
          Tabela de Grupos
        </Link>
        <Link
          href="/partidas"
          className="bg-[var(--surface)] text-white font-bold px-6 py-3 rounded-full text-center border border-white/10 hover:border-white/30 transition-all"
        >
          Partidas
        </Link>
        <Link
          href="/chaveamento"
          className="bg-[var(--surface)] text-white font-bold px-6 py-3 rounded-full text-center border border-white/10 hover:border-white/30 transition-all"
        >
          Chaveamento
        </Link>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/bolao"
            className="bg-[var(--copa-gold)] text-black font-black px-8 py-3 rounded-full text-center hover:brightness-110 transition-all"
          >
            Meu Bolão
          </Link>
          <p className="text-white/40 text-sm">
            Olá, {user.user_metadata.full_name ?? user.email}
          </p>
          <BotaoLogout />
        </div>
      ) : (
        <BotaoLogin />
      )}
    </main>
  )
}
