'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarGrupo } from '@/app/bolao/actions'

export default function FormCriarGrupo() {
  const [nome, setNome] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setCarregando(true)
    setErro('')

    const result = await criarGrupo(nome.trim())

    if (result.erro) {
      setErro(result.erro)
      setCarregando(false)
      return
    }

    router.push(`/bolao/${result.grupo.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Nome do grupo (ex: Bolão do Trabalho)"
        value={nome}
        onChange={e => setNome(e.target.value)}
        maxLength={40}
        className="bg-[var(--background)] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
      />
      {erro && <p className="text-[var(--copa-red)] text-sm">{erro}</p>}
      <button
        type="submit"
        disabled={carregando || !nome.trim()}
        className="bg-[var(--copa-gold)] text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
      >
        {carregando ? 'Criando...' : 'Criar grupo'}
      </button>
    </form>
  )
}
