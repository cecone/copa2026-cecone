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
    <div className={`rounded-2xl border border-[var(--line)] bg-[var(--turf)] p-4 ${encerrada ? 'opacity-60' : ''}`}>
      {/* Times */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Bandeira codigo={partida.selecao_casa.codigo} emoji={partida.selecao_casa.bandeira} nome={partida.selecao_casa.nome} tamanho="sm" />
          <span className="truncate text-sm font-medium text-[var(--chalk)]">{partida.selecao_casa.nome}</span>
        </div>
        <span className="text-xs text-[var(--mist)]">vs</span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-medium text-[var(--chalk)]">{partida.selecao_fora.nome}</span>
          <Bandeira codigo={partida.selecao_fora.codigo} emoji={partida.selecao_fora.bandeira} nome={partida.selecao_fora.nome} tamanho="sm" />
        </div>
      </div>

      <div className="mb-3 text-center text-[10px] uppercase tracking-wider text-[var(--mist)]">
        {partida.fase} · {partida.hora}
      </div>

      {/* Inputs de placar */}
      {encerrada ? (
        <div className="space-y-1 text-center text-xs">
          {partida.status === 'ao_vivo' ? (
            <span className="text-[var(--mist)]">Partida em andamento</span>
          ) : (
            <>
              <span className="block text-[var(--mist)]">
                Resultado: {partida.gols_casa} × {partida.gols_fora}
              </span>
              {palpiteAtual && (
                <span className="block text-[var(--chalk)]">
                  Seu palpite: {palpiteAtual.gols_casa} × {palpiteAtual.gols_fora}
                </span>
              )}
              {pontos !== null && (
                <span className={`mt-2 block font-display text-lg font-bold ${
                  pontos === 7 ? 'text-[var(--copa-gold)]' :
                  pontos === 3 ? 'text-emerald-400' :
                  'text-[var(--mist)]'
                }`}>
                  {pontos} pts
                </span>
              )}
              {partida.status === 'encerrada' && !palpiteAtual && (
                <span className="block text-[var(--mist)]/60">Sem palpite registrado</span>
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
            className="campo campo-placar"
          />
          <span className="text-lg font-light text-[var(--mist)]">×</span>
          <input
            type="number"
            min={0}
            max={20}
            value={fora}
            onChange={e => setFora(e.target.value)}
            className="campo campo-placar"
          />
          <button
            onClick={handleSalvar}
            disabled={salvando || casa === '' || fora === ''}
            className={`btn btn-sm whitespace-nowrap ${salvo ? 'btn-ok' : 'btn-gold'}`}
          >
            {salvando ? '...' : salvo ? '✓' : 'Salvar'}
          </button>
        </div>
      )}
      {erro && <p className="mt-2 text-xs text-[var(--copa-red)]">{erro}</p>}
    </div>
  )
}
