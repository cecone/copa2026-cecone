'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { entrarGrupo } from '@/app/bolao/actions'

export default function FormEntrarGrupo() {
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    setCarregando(true)
    setErro('')

    const result = await entrarGrupo(codigo.trim())

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
        placeholder="Código do grupo (ex: AB12CD)"
        value={codigo}
        onChange={e => setCodigo(e.target.value.toUpperCase())}
        maxLength={6}
        className="campo font-mono uppercase tracking-widest"
      />
      {erro && <p className="text-sm text-[var(--copa-red)]">{erro}</p>}
      <button type="submit" disabled={carregando || codigo.length < 6} className="btn btn-blue btn-block">
        {carregando ? 'Entrando...' : 'Entrar no grupo'}
      </button>
    </form>
  )
}
