import { Grupo } from '@/types'
import Bandeira from './Bandeira'

type Props = {
  grupo: Grupo
}

export default function TabelaGrupo({ grupo }: Props) {
  const times = [...grupo.times].sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos
    if (b.saldo !== a.saldo) return b.saldo - a.saldo
    return b.gols_marcados - a.gols_marcados
  })

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      {/* Cabeçalho do grupo */}
      <div className="bg-[var(--copa-blue)] px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Grupo</span>
        <span className="text-lg font-black text-[var(--copa-gold)]">{grupo.nome}</span>
      </div>

      {/* Tabela */}
      <div className="bg-[var(--surface)]">
        {/* Cabeçalho das colunas */}
        <div className="grid grid-cols-[1fr_repeat(6,_auto)] gap-x-3 px-4 py-2 text-xs text-white/40 font-semibold uppercase tracking-wider border-b border-white/10">
          <span>Seleção</span>
          <span className="text-center w-6">J</span>
          <span className="text-center w-6">V</span>
          <span className="text-center w-6">E</span>
          <span className="text-center w-6">D</span>
          <span className="text-center w-8">SG</span>
          <span className="text-center w-8">Pts</span>
        </div>

        {/* Linhas das seleções */}
        {times.map((item, index) => {
          const avanca = index < 2
          return (
            <div
              key={item.selecao.id}
              className={`grid grid-cols-[1fr_repeat(6,_auto)] gap-x-3 px-4 py-3 items-center text-sm border-b border-white/5 last:border-0 ${
                avanca ? 'bg-[var(--copa-blue)]/10' : ''
              }`}
            >
              {/* Seleção */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-white/30 w-3">{index + 1}</span>
                <Bandeira codigo={item.selecao.codigo} emoji={item.selecao.bandeira} nome={item.selecao.nome} tamanho="sm" />
                <span className={`truncate font-medium ${avanca ? 'text-white' : 'text-white/70'}`}>
                  {item.selecao.nome}
                </span>
                {avanca && (
                  <span className="hidden sm:inline-block text-[10px] bg-[var(--copa-blue)] text-white px-1.5 py-0.5 rounded font-bold ml-1">
                    ✓
                  </span>
                )}
              </div>

              <span className="text-center w-6 text-white/60">{item.jogos}</span>
              <span className="text-center w-6 text-white/60">{item.vitorias}</span>
              <span className="text-center w-6 text-white/60">{item.empates}</span>
              <span className="text-center w-6 text-white/60">{item.derrotas}</span>
              <span className={`text-center w-8 ${item.saldo > 0 ? 'text-green-400' : item.saldo < 0 ? 'text-red-400' : 'text-white/60'}`}>
                {item.saldo > 0 ? `+${item.saldo}` : item.saldo}
              </span>
              <span className={`text-center w-8 font-bold ${avanca ? 'text-[var(--copa-gold)]' : 'text-white'}`}>
                {item.pontos}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="bg-[var(--surface)] px-4 py-2 flex items-center gap-2 border-t border-white/10">
        <span className="w-2 h-2 rounded-sm bg-[var(--copa-blue)]"></span>
        <span className="text-[10px] text-white/30">Avança para as oitavas</span>
      </div>
    </div>
  )
}
