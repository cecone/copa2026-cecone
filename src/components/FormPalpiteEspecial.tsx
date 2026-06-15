'use client'

import { useState } from 'react'
import { salvarPalpiteEspecial } from '@/app/bolao/actions'
import Bandeira from './Bandeira'

type Selecao = { id: number; nome: string; codigo: string; bandeira: string }

type Props = {
  grupoId: string
  selecoes: Selecao[]
  palpiteAtual?: { campeao_id: number | null } | null
}

export default function FormPalpiteEspecial({ grupoId, selecoes, palpiteAtual }: Props) {
  const [campeaoId, setCampeaoId] = useState(palpiteAtual?.campeao_id?.toString() ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const campeaoSelecionado = selecoes.find(s => s.id.toString() === campeaoId)

  async function handleSalvar() {
    if (!campeaoId) return
    setSalvando(true)
    setErro('')
    const result = await salvarPalpiteEspecial(grupoId, Number(campeaoId))
    if (result.erro) {
      setErro(result.erro)
    } else {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2500)
    }
    setSalvando(false)
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--copa-gold)]/30 bg-[var(--turf)]">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 border-b border-[var(--copa-gold)]/20 bg-[var(--copa-gold)]/10 px-4 py-3">
        <span className="text-base text-[var(--copa-gold)]">★</span>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--copa-gold)]">
          Palpites Especiais
        </h3>
      </div>

      <div className="flex flex-col gap-5 p-4">
        {/* Campeão */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--mist)]">
            Campeão da Copa
          </label>
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-8 shrink-0 items-center justify-center">
              {campeaoSelecionado ? (
                <Bandeira
                  codigo={campeaoSelecionado.codigo}
                  emoji={campeaoSelecionado.bandeira}
                  nome={campeaoSelecionado.nome}
                  tamanho="md"
                />
              ) : (
                <span className="text-xl text-[var(--mist)]">?</span>
              )}
            </div>
            <select
              value={campeaoId}
              onChange={e => setCampeaoId(e.target.value)}
              className="campo flex-1 cursor-pointer appearance-none text-sm"
            >
              <option value="">Escolha uma seleção…</option>
              {selecoes.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={handleSalvar}
          disabled={salvando || !campeaoId}
          className={`btn btn-block ${salvo ? 'btn-ok' : 'btn-gold'}`}
        >
          {salvando ? 'Salvando…' : salvo ? '✓ Salvo!' : 'Salvar palpites especiais'}
        </button>

        {erro && <p className="text-xs text-[var(--copa-red)]">{erro}</p>}
      </div>
    </div>
  )
}
