'use client'

import { useState } from 'react'
import { salvarPalpite } from '@/app/bolao/actions'
import Bandeira from './Bandeira'
import { Partida } from '@/types'

type Props = {
  partida: Partida
  grupoId: string
  palpiteAtual?: { gols_casa: number; gols_fora: number } | null
}

export default function FormPalpite({ partida, grupoId, palpiteAtual }: Props) {
  const [casa, setCasa] = useState(palpiteAtual?.gols_casa ?? '')
  const [fora, setFora] = useState(palpiteAtual?.gols_fora ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const encerrada = partida.status === 'encerrada' || partida.status === 'ao_vivo'

  function calcularPontos(): number | null {
    if (partida.status !== 'encerrada') return null
    if (!palpiteAtual) return null
    if (partida.gols_casa === null || partida.gols_fora === null) return null
    if (palpiteAtual.gols_casa === partida.gols_casa && palpiteAtual.gols_fora === partida.gols_fora) return 7
    const resultadoReal = Math.sign(partida.gols_casa - partida.gols_fora)
    const resultadoPalpite = Math.sign(palpiteAtual.gols_casa - palpiteAtual.gols_fora)
    if (resultadoReal === resultadoPalpite) return 3
    return 0
  }

  const pontos = calcularPontos()

  async function handleSalvar() {
    if (casa === '' || fora === '') return
    setSalvando(true)
    setErro('')

    const result = await salvarPalpite(grupoId, partida.id, Number(casa), Number(fora))

    if (result.erro) {
      setErro(result.erro)
    } else {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    }
    setSalvando(false)
  }

  return (
    <div className={`bg-[var(--surface)] rounded-xl border p-4 ${encerrada ? 'border-white/5 opacity-60' : 'border-white/10'}`}>
      {/* Times */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Bandeira codigo={partida.selecao_casa.codigo} emoji={partida.selecao_casa.bandeira} nome={partida.selecao_casa.nome} tamanho="sm" />
          <span className="text-sm font-medium text-white/80 truncate">{partida.selecao_casa.nome}</span>
        </div>
        <span className="text-white/20 text-xs">vs</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium text-white/80 truncate text-right">{partida.selecao_fora.nome}</span>
          <Bandeira codigo={partida.selecao_fora.codigo} emoji={partida.selecao_fora.bandeira} nome={partida.selecao_fora.nome} tamanho="sm" />
        </div>
      </div>

      <div className="text-[10px] text-white/30 text-center mb-3 uppercase tracking-wider">
        {partida.fase} · {partida.hora}
      </div>

      {/* Inputs de placar */}
      {encerrada ? (
        <div className="text-center text-xs space-y-1">
          {partida.status === 'ao_vivo' ? (
            <span className="text-white/30">Partida em andamento</span>
          ) : (
            <>
              <span className="block text-white/30">
                Resultado: {partida.gols_casa} × {partida.gols_fora}
              </span>
              {palpiteAtual && (
                <span className="block text-white/50">
                  Seu palpite: {palpiteAtual.gols_casa} × {palpiteAtual.gols_fora}
                </span>
              )}
              {pontos !== null && (
                <span className={`block font-bold mt-2 ${
                  pontos === 7 ? 'text-[var(--copa-gold)]' :
                  pontos === 3 ? 'text-green-400' :
                  'text-white/30'
                }`}>
                  {pontos} pts
                </span>
              )}
              {partida.status === 'encerrada' && !palpiteAtual && (
                <span className="block text-white/20">Sem palpite registrado</span>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={20}
            value={casa}
            onChange={e => setCasa(e.target.value)}
            className="w-full text-center text-xl font-bold bg-[var(--background)] border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
          />
          <span className="text-white/30 font-light text-lg">×</span>
          <input
            type="number"
            min={0}
            max={20}
            value={fora}
            onChange={e => setFora(e.target.value)}
            className="w-full text-center text-xl font-bold bg-[var(--background)] border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-[var(--copa-gold)] transition-colors"
          />
          <button
            onClick={handleSalvar}
            disabled={salvando || casa === '' || fora === ''}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              salvo
                ? 'bg-green-600 text-white'
                : 'bg-[var(--copa-gold)] text-black hover:brightness-110 disabled:opacity-40'
            }`}
          >
            {salvando ? '...' : salvo ? '✓' : 'Salvar'}
          </button>
        </div>
      )}
      {erro && <p className="text-[var(--copa-red)] text-xs mt-2">{erro}</p>}
    </div>
  )
}
