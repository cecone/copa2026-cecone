'use client'

import { useState } from 'react'
import { atualizarPartida } from '@/app/admin/actions'
import Bandeira from '@/components/Bandeira'
import { emojiBandeira } from '@/lib/emoji-bandeiras'

type Partida = {
  id: number
  fase: string
  data_hora: string
  gols_casa: number | null
  gols_fora: number | null
  encerrada: boolean
  corrigida_manualmente: boolean
  selecao_casa: { nome: string; bandeira_url: string; codigo: string } | null
  selecao_fora: { nome: string; bandeira_url: string; codigo: string } | null
}

type Props = { partida: Partida }

export default function FormEditarPartida({ partida }: Props) {
  const [golsCasa, setGolsCasa] = useState<string>(partida.gols_casa?.toString() ?? '')
  const [golsFora, setGolsFora] = useState<string>(partida.gols_fora?.toString() ?? '')
  const [encerrada, setEncerrada] = useState(partida.encerrada)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const nomeCasa = partida.selecao_casa?.nome ?? '?'
  const nomeFora = partida.selecao_fora?.nome ?? '?'

  async function handleSalvar() {
    setSalvando(true)
    setErro('')

    const result = await atualizarPartida(
      partida.id,
      golsCasa !== '' ? Number(golsCasa) : null,
      golsFora !== '' ? Number(golsFora) : null,
      encerrada
    )

    if (result.erro) {
      setErro(result.erro)
    } else {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    }
    setSalvando(false)
  }

  return (
    <div className={`rounded-2xl border p-4 ${partida.corrigida_manualmente ? 'border-[var(--copa-gold)]/30' : 'border-[var(--line)]'} bg-[var(--turf)]`}>
      {/* Times */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {partida.selecao_casa && (
            <Bandeira codigo={partida.selecao_casa.codigo} emoji={emojiBandeira(partida.selecao_casa.codigo)} nome={nomeCasa} tamanho="sm" />
          )}
          <span className="truncate text-sm font-semibold text-[var(--chalk)]">{nomeCasa}</span>
        </div>
        <span className="shrink-0 text-xs text-[var(--mist)]">vs</span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold text-[var(--chalk)]">{nomeFora}</span>
          {partida.selecao_fora && (
            <Bandeira codigo={partida.selecao_fora.codigo} emoji={emojiBandeira(partida.selecao_fora.codigo)} nome={nomeFora} tamanho="sm" />
          )}
        </div>
      </div>

      <div className="mb-3 text-center text-[10px] uppercase tracking-wider text-[var(--mist)]">
        {partida.fase} · {new Date(partida.data_hora).toLocaleDateString('pt-BR')}
        {partida.corrigida_manualmente && <span className="ml-2 text-[var(--copa-gold)]">✎ corrigido</span>}
      </div>

      {/* Placar */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={30}
          value={golsCasa}
          onChange={e => setGolsCasa(e.target.value)}
          placeholder="–"
          className="campo campo-placar"
        />
        <span className="shrink-0 text-lg font-light text-[var(--mist)]">×</span>
        <input
          type="number"
          min={0}
          max={30}
          value={golsFora}
          onChange={e => setGolsFora(e.target.value)}
          placeholder="–"
          className="campo campo-placar"
        />
      </div>

      {/* Encerrada */}
      <label className="mb-3 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={encerrada}
          onChange={e => setEncerrada(e.target.checked)}
          className="h-4 w-4 accent-[var(--copa-gold)]"
        />
        <span className="text-sm text-[var(--mist)]">Partida encerrada</span>
      </label>

      {erro && <p className="mb-2 text-xs text-[var(--copa-red)]">{erro}</p>}

      <button
        onClick={handleSalvar}
        disabled={salvando}
        className={`btn btn-block text-sm ${salvo ? 'btn-ok' : 'btn-gold'}`}
      >
        {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar'}
      </button>
    </div>
  )
}
