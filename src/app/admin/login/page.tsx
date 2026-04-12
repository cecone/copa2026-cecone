'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '../actions'

export default function AdminLoginPage() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    const result = await loginAdmin(usuario, senha)

    if (result.erro) {
      setErro(result.erro)
      setCarregando(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-[var(--copa-gold)] text-center mb-2">
          Copa 2026 do Cecone
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">Área administrativa</p>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-xl p-6 border border-white/10 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              autoComplete="username"
              className="bg-[var(--background)] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
              className="bg-[var(--background)] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
            />
          </div>

          {erro && <p className="text-[var(--copa-red)] text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={carregando || !usuario || !senha}
            className="bg-[var(--copa-gold)] text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-40 mt-2"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
