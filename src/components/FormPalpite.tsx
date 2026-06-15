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

  const aoVivo = partida.status === 'ao_vivo'
  const bloqueado = partida.status === 'encerrada' || aoVivo

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
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--turf)] p-4">
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

      {bloqueado ? (
        aoVivo ? (
          /* EM ANDAMENTO */
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-[var(--turf-2)] px-3 py-2 text-center">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--copa-red)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--copa-red)] animate-pulse motion-reduce:animate-none" />
                Ao vivo{partida.minuto ? ` · ${partida.minuto}'` : ''}
              </p>
              <p className="tnum mt-0.5 font-display text-xl font-bold text-[var(--chalk)]">
                {partida.gols_casa ?? 0} – {partida.gols_fora ?? 0}
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-[var(--turf-2)] px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-[var(--mist)]">Seu palpite</p>
              <p className="tnum mt-0.5 font-display text-xl font-bold text-[var(--mist)]">
                {palpiteAtual ? `${palpiteAtual.gols_casa} – ${palpiteAtual.gols_fora}` : '—'}
              </p>
            </div>
          </div>
        ) : (
          /* ENCERRADA */
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg bg-[var(--turf-2)] px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-[var(--mist)]">Final</p>
                <p className="tnum mt-0.5 font-display text-xl font-bold text-[var(--chalk)]">
                  {partida.gols_casa} – {partida.gols_fora}
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[var(--turf-2)] px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-[var(--mist)]">Seu palpite</p>
                <p className={`tnum mt-0.5 font-display text-xl font-bold ${
                  palpiteAtual ? (pontos === 7 ? 'text-[var(--copa-gold)]' : 'text-[var(--mist)]') : 'text-[var(--mist)]/50'
                }`}>
                  {palpiteAtual ? `${palpiteAtual.gols_casa} – ${palpiteAtual.gols_fora}` : '—'}
                </p>
              </div>
            </div>

            {palpiteAtual && pontos !== null ? (
              <PontosBadge pontos={pontos} />
            ) : (
              <p className="text-center text-xs text-[var(--mist)]/70">Você não palpitou neste jogo</p>
            )}
          </div>
        )
      ) : (
        /* ABERTA PARA PALPITE */
        <>
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
          {erro && <p className="mt-2 text-xs text-[var(--copa-red)]">{erro}</p>}
        </>
      )}
    </div>
  )
}

function PontosBadge({ pontos }: { pontos: number }) {
  const cfg =
    pontos === 7
      ? { wrap: 'border-[var(--copa-gold)]/30 bg-[var(--copa-gold)]/10', accent: 'text-[var(--copa-gold)]', label: 'Cravou o placar!' }
      : pontos === 3
      ? { wrap: 'border-emerald-400/30 bg-emerald-400/10', accent: 'text-emerald-400', label: 'Acertou o resultado' }
      : { wrap: 'border-[var(--line)] bg-[var(--turf-2)]', accent: 'text-[var(--mist)]', label: 'Não pontuou' }

  return (
    <div className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 ${cfg.wrap}`}>
      <span className={`font-display text-xl font-bold tnum ${cfg.accent}`}>+{pontos}</span>
      <span className={`text-xs font-semibold ${cfg.accent}`}>pts</span>
      <span className="text-xs text-[var(--mist)]">· {cfg.label}</span>
    </div>
  )
}
