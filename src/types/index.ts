export type Selecao = {
  id: number
  nome: string
  codigo: string // BRA, ARG, etc.
  bandeira: string // emoji da bandeira
}

export type ClassificacaoGrupo = {
  selecao: Selecao
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  gols_marcados: number
  gols_sofridos: number
  saldo: number
  pontos: number
}

export type Grupo = {
  nome: string // "A", "B", etc.
  times: ClassificacaoGrupo[]
}

export type FaseEliminatoria = 'oitavas' | 'quartas' | 'semi' | 'terceiro' | 'final'

export type StatusPartida = 'encerrada' | 'ao_vivo' | 'agendada'

export type Partida = {
  id: number
  fase: string // 'Grupo A', 'Grupo B', 'Oitavas', etc.
  data: string // ISO date string
  hora: string // '18:00'
  selecao_casa: Selecao
  selecao_fora: Selecao
  gols_casa: number | null
  gols_fora: number | null
  status: StatusPartida
  minuto?: number // minuto atual se ao_vivo
}
