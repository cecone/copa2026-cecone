'use client'

import { useState } from 'react'
import { atualizarPartida } from '@/app/admin/actions'

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

const bandeiras: Record<string, string> = {
  BRA: '🇧🇷', MEX: '🇲🇽', SRB: '🇷🇸', CMR: '🇨🇲',
  ARG: '🇦🇷', POL: '🇵🇱', KSA: '🇸🇦', AUS: '🇦🇺',
  FRA: '🇫🇷', DEN: '🇩🇰', TUN: '🇹🇳', PER: '🇵🇪',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', USA: '🇺🇸', IRN: '🇮🇷', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
}

export default function FormEditarPartida({ partida }: Props) {
  const [golsCasa, setGolsCasa] = useState<string>(partida.gols_casa?.toString() ?? '')
  const [golsFora, setGolsFora] = useState<string>(partida.gols_fora?.toString() ?? '')
  const [encerrada, setEncerrada] = useState(partida.encerrada)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const nomeCasa = partida.selecao_casa?.nome ?? '?'
  const nomeFora = partida.selecao_fora?.nome ?? '?'
  const flagCasa = partida.selecao_casa ? (bandeiras[partida.selecao_casa.codigo] ?? '🏳️') : '?'
  const flagFora = partida.selecao_fora ? (bandeiras[partida.selecao_fora.codigo] ?? '🏳️') : '?'

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
    <div className={`bg-[var(--surface)] rounded-xl border p-4 ${partida.corrigida_manualmente ? 'border-[var(--copa-gold)]/30' : 'border-white/10'}`}>
      {/* Times */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{flagCasa}</span>
          <span className="text-sm font-semibold text-white/80 truncate">{nomeCasa}</span>
        </div>
        <span className="text-white/20 text-xs shrink-0">vs</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-semibold text-white/80 truncate text-right">{nomeFora}</span>
          <span className="text-xl">{flagFora}</span>
        </div>
      </div>

      <div className="text-[10px] text-white/30 text-center mb-3 uppercase tracking-wider">
        {partida.fase} · {new Date(partida.data_hora).toLocaleDateString('pt-BR')}
        {partida.corrigida_manualmente && <span className="text-[var(--copa-gold)] ml-2">✎ corrigido</span>}
      </div>

      {/* Placar */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="number"
          min={0}
          max={30}
          value={golsCasa}
          onChange={e => setGolsCasa(e.target.value)}
          placeholder="–"
          className="w-full text-center text-xl font-bold bg-[var(--background)] border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
        />
        <span className="text-white/30 font-light text-lg shrink-0">×</span>
        <input
          type="number"
          min={0}
          max={30}
          value={golsFora}
          onChange={e => setGolsFora(e.target.value)}
          placeholder="–"
          className="w-full text-center text-xl font-bold bg-[var(--background)] border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
        />
      </div>

      {/* Encerrada */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={encerrada}
          onChange={e => setEncerrada(e.target.checked)}
          className="w-4 h-4 accent-[var(--copa-gold)]"
        />
        <span className="text-sm text-white/60">Partida encerrada</span>
      </label>

      {erro && <p className="text-[var(--copa-red)] text-xs mb-2">{erro}</p>}

      <button
        onClick={handleSalvar}
        disabled={salvando}
        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
          salvo
            ? 'bg-green-600 text-white'
            : 'bg-[var(--copa-gold)] text-black hover:brightness-110 disabled:opacity-40'
        }`}
      >
        {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar'}
      </button>
    </div>
  )
}
