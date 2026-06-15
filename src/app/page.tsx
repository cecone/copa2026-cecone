import { createClient } from '@/lib/supabase-server'
import BotaoLogin from '@/components/BotaoLogin'
import BotaoLogout from '@/components/BotaoLogout'
import LogoApp from '@/components/LogoApp'
import HeroProximoJogo from '@/components/HeroProximoJogo'
import Link from 'next/link'

export const revalidate = 30 // mantém o herói fresco

// Ícones em linha (stroke), pequenos e no tema
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const NAV = [
  {
    href: '/grupos',
    titulo: 'Grupos',
    sub: 'Classificação ao vivo',
    d: 'M4 6h7v5H4zM13 6h7v5h-7zM4 13h7v5H4zM13 13h7v5h-7z',
  },
  {
    href: '/partidas',
    titulo: 'Partidas',
    sub: 'Jogos e resultados',
    d: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 3v18M3.5 9.5h17M3.5 14.5h17',
  },
  {
    href: '/chaveamento',
    titulo: 'Chaveamento',
    sub: 'O caminho até a final',
    d: 'M5 4v5a2 2 0 002 2h5M5 20v-5a2 2 0 012-2h5M12 12h7',
  },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen px-5 py-12 sm:py-16">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Identidade */}
        <LogoApp tamanho="lg" />
        <p className="mt-3 text-center text-sm text-[var(--mist)]">
          Tabela ao vivo e bolão da Copa do Mundo 2026
        </p>

        {/* Herói: jogo ao vivo ou próximo jogo (some sozinho se não houver) */}
        <div className="mt-8 w-full">
          <HeroProximoJogo />
        </div>

        {/* Navegação principal como cartões */}
        <nav className="mt-6 flex w-full flex-col gap-3">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--turf)] px-5 py-4 transition-colors hover:border-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--copa-gold)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--turf-2)] text-[var(--chalk)]">
                <Icon d={item.d} />
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg font-semibold uppercase text-[var(--chalk)]">
                  {item.titulo}
                </span>
                <span className="block text-xs text-[var(--mist)]">{item.sub}</span>
              </span>
              <span className="text-[var(--mist)] transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </nav>

        {/* Bolão — o único momento dourado da tela */}
        <div className="mt-8 w-full">
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/bolao"
                className="w-full rounded-2xl bg-[var(--copa-gold)] px-6 py-4 text-center font-display text-xl font-bold uppercase tracking-wide text-[#0A130F] shadow-[0_5px_0_0_#B8862A] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#B8862A]"
              >
                ★ Meu bolão
              </Link>
              <p className="text-sm text-[var(--mist)]">
                Olá, {user.user_metadata.full_name ?? user.email}
              </p>
              <BotaoLogout />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-center text-sm text-[var(--mist)]">
                Entre pra criar seu bolão e palpitar com os amigos.
              </p>
              <BotaoLogin />
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-[11px] text-[var(--mist)]/70">
          Dados ao vivo via wc2026api
        </p>
      </div>
    </main>
  )
}
