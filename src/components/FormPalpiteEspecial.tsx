'use client'

import { useState } from 'react'
import { salvarPalpiteEspecial } from '@/app/bolao/actions'
import Bandeira from './Bandeira'

type Selecao = { id: number; nome: string; codigo: string; bandeira: string }

type Props = {
  grupoId: string
  selecoes: Selecao[]
  palpiteAtual?: { campeao_id: number | null; artilheiro_id: number | null } | null
}

export default function FormPalpiteEspecial({ grupoId, selecoes, palpiteAtual }: Props) {
  const [campeaoId, setCampeaoId] = useState(palpiteAtual?.campeao_id?.toString() ?? '')
  const [artilheiroId, setArtilheiroId] = useState(palpiteAtual?.artilheiro_id?.toString() ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const campeaoSelecionado = selecoes.find(s => s.id.toString() === campeaoId)
  const artilheiroSelecionado = selecoes.find(s => s.id.toString() === artilheiroId)

  async function handleSalvar() {
    if (!campeaoId || !artilheiroId) return
    setSalvando(true)
    setErro('')
    const result = await salvarPalpiteEspecial(grupoId, Number(campeaoId), Number(artilheiroId))
    if (result.erro) {
      setErro(result.erro)
    } else {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2500)
    }
    setSalvando(false)
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--copa-gold)]/30 overflow-hidden mb-8">
      {/* Cabeçalho */}
      <div className="bg-[var(--copa-gold)]/10 px-4 py-3 border-b border-[var(--copa-gold)]/20 flex items-center gap-2">
        <span className="text-[var(--copa-gold)] text-base">★</span>
        <h3 className="text-sm font-bold text-[var(--copa-gold)] uppercase tracking-wider">
          Palpites Especiais
        </h3>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* Campeão */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold block mb-2">
            Campeão da Copa
          </label>
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-8 h-6 flex items-center justify-center">
              {campeaoSelecionado ? (
                <Bandeira
                  codigo={campeaoSelecionado.codigo}
                  emoji={campeaoSelecionado.bandeira}
                  nome={campeaoSelecionado.nome}
                  tamanho="md"
                />
              ) : (
                <span className="text-white/20 text-xl">?</span>
              )}
            </div>
            <select
              value={campeaoId}
              onChange={e => setCampeaoId(e.target.value)}
              className="flex-1 bg-[var(--background)] border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--copa-gold)] transition-colors appearance-none cursor-pointer"
            >
              <option value="">Escolha uma seleção…</option>
              {selecoes.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Artilheira */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider font-semibold block mb-2">
            Seleção Artilheira
          </label>
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-8 h-6 flex items-center justify-center">
              {artilheiroSelecionado ? (
                <Bandeira
                  codigo={artilheiroSelecionado.codigo}
                  emoji={artilheiroSelecionado.bandeira}
                  nome={artilheiroSelecionado.nome}
                  tamanho="md"
                />
              ) : (
                <span className="text-white/20 text-xl">?</span>
              )}
            </div>
            <select
              value={artilheiroId}
              onChange={e => setArtilheiroId(e.target.value)}
              className="flex-1 bg-[var(--background)] border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--copa-gold)] transition-colors appearance-none cursor-pointer"
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
          disabled={salvando || !campeaoId || !artilheiroId}
          className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
            salvo
              ? 'bg-green-600 text-white'
              : 'bg-[var(--copa-gold)] text-black hover:brightness-110 disabled:opacity-40'
          }`}
        >
          {salvando ? 'Salvando…' : salvo ? '✓ Salvo!' : 'Salvar palpites especiais'}
        </button>

        {erro && <p className="text-[var(--copa-red)] text-xs">{erro}</p>}
      </div>
    </div>
  )
}
