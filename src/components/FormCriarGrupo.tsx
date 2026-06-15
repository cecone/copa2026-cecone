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
        className="campo"
      />
      {erro && <p className="text-sm text-[var(--copa-red)]">{erro}</p>}
      <button type="submit" disabled={carregando || !nome.trim()} className="btn btn-gold btn-block">
        {carregando ? 'Criando...' : 'Criar grupo'}
      </button>
    </form>
  )
}
