import { Grupo, Partida, FaseEliminatoria } from '@/types'

export type PartidaEliminatoria = {
  id: number
  fase: FaseEliminatoria
  jogo: number // número do confronto dentro da fase
  data: string
  hora: string
  selecao_casa: typeof BRA | null
  selecao_fora: typeof BRA | null
  gols_casa: number | null
  gols_fora: number | null
  penaltis_casa?: number | null
  penaltis_fora?: number | null
  status: 'encerrada' | 'ao_vivo' | 'agendada' | 'a_definir'
  minuto?: number
}

export const gruposMock: Grupo[] = [
  {
    nome: 'A',
    times: [
      { selecao: { id: 1, nome: 'Brasil', codigo: 'BRA', bandeira: '🇧🇷' }, jogos: 3, vitorias: 3, empates: 0, derrotas: 0, gols_marcados: 7, gols_sofridos: 1, saldo: 6, pontos: 9 },
      { selecao: { id: 2, nome: 'México', codigo: 'MEX', bandeira: '🇲🇽' }, jogos: 3, vitorias: 1, empates: 1, derrotas: 1, gols_marcados: 4, gols_sofridos: 4, saldo: 0, pontos: 4 },
      { selecao: { id: 3, nome: 'Sérvia', codigo: 'SRB', bandeira: '🇷🇸' }, jogos: 3, vitorias: 1, empates: 0, derrotas: 2, gols_marcados: 3, gols_sofridos: 5, saldo: -2, pontos: 3 },
      { selecao: { id: 4, nome: 'Camarões', codigo: 'CMR', bandeira: '🇨🇲' }, jogos: 3, vitorias: 0, empates: 1, derrotas: 2, gols_marcados: 2, gols_sofridos: 6, saldo: -4, pontos: 1 },
    ],
  },
  {
    nome: 'B',
    times: [
      { selecao: { id: 5, nome: 'Argentina', codigo: 'ARG', bandeira: '🇦🇷' }, jogos: 3, vitorias: 2, empates: 1, derrotas: 0, gols_marcados: 5, gols_sofridos: 2, saldo: 3, pontos: 7 },
      { selecao: { id: 6, nome: 'Polônia', codigo: 'POL', bandeira: '🇵🇱' }, jogos: 3, vitorias: 1, empates: 1, derrotas: 1, gols_marcados: 3, gols_sofridos: 3, saldo: 0, pontos: 4 },
      { selecao: { id: 7, nome: 'Arábia Saudita', codigo: 'KSA', bandeira: '🇸🇦' }, jogos: 3, vitorias: 1, empates: 0, derrotas: 2, gols_marcados: 3, gols_sofridos: 4, saldo: -1, pontos: 3 },
      { selecao: { id: 8, nome: 'Austrália', codigo: 'AUS', bandeira: '🇦🇺' }, jogos: 3, vitorias: 0, empates: 2, derrotas: 1, gols_marcados: 2, gols_sofridos: 4, saldo: -2, pontos: 2 },
    ],
  },
  {
    nome: 'C',
    times: [
      { selecao: { id: 9, nome: 'França', codigo: 'FRA', bandeira: '🇫🇷' }, jogos: 3, vitorias: 3, empates: 0, derrotas: 0, gols_marcados: 6, gols_sofridos: 1, saldo: 5, pontos: 9 },
      { selecao: { id: 10, nome: 'Dinamarca', codigo: 'DEN', bandeira: '🇩🇰' }, jogos: 3, vitorias: 1, empates: 1, derrotas: 1, gols_marcados: 3, gols_sofridos: 3, saldo: 0, pontos: 4 },
      { selecao: { id: 11, nome: 'Tunísia', codigo: 'TUN', bandeira: '🇹🇳' }, jogos: 3, vitorias: 0, empates: 2, derrotas: 1, gols_marcados: 2, gols_sofridos: 3, saldo: -1, pontos: 2 },
      { selecao: { id: 12, nome: 'Peru', codigo: 'PER', bandeira: '🇵🇪' }, jogos: 3, vitorias: 0, empates: 1, derrotas: 2, gols_marcados: 1, gols_sofridos: 5, saldo: -4, pontos: 1 },
    ],
  },
  {
    nome: 'D',
    times: [
      { selecao: { id: 13, nome: 'Inglaterra', codigo: 'ENG', bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, jogos: 3, vitorias: 2, empates: 0, derrotas: 1, gols_marcados: 5, gols_sofridos: 3, saldo: 2, pontos: 6 },
      { selecao: { id: 14, nome: 'Estados Unidos', codigo: 'USA', bandeira: '🇺🇸' }, jogos: 3, vitorias: 1, empates: 2, derrotas: 0, gols_marcados: 4, gols_sofridos: 3, saldo: 1, pontos: 5 },
      { selecao: { id: 15, nome: 'Irã', codigo: 'IRN', bandeira: '🇮🇷' }, jogos: 3, vitorias: 1, empates: 0, derrotas: 2, gols_marcados: 3, gols_sofridos: 5, saldo: -2, pontos: 3 },
      { selecao: { id: 16, nome: 'País de Gales', codigo: 'WAL', bandeira: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' }, jogos: 3, vitorias: 0, empates: 0, derrotas: 3, gols_marcados: 1, gols_sofridos: 7, saldo: -6, pontos: 0 },
    ],
  },
]

const BRA = { id: 1, nome: 'Brasil', codigo: 'BRA', bandeira: '🇧🇷' }
const MEX = { id: 2, nome: 'México', codigo: 'MEX', bandeira: '🇲🇽' }
const SRB = { id: 3, nome: 'Sérvia', codigo: 'SRB', bandeira: '🇷🇸' }
const CMR = { id: 4, nome: 'Camarões', codigo: 'CMR', bandeira: '🇨🇲' }
const ARG = { id: 5, nome: 'Argentina', codigo: 'ARG', bandeira: '🇦🇷' }
const POL = { id: 6, nome: 'Polônia', codigo: 'POL', bandeira: '🇵🇱' }
const KSA = { id: 7, nome: 'Arábia Saudita', codigo: 'KSA', bandeira: '🇸🇦' }
const AUS = { id: 8, nome: 'Austrália', codigo: 'AUS', bandeira: '🇦🇺' }
const FRA = { id: 9, nome: 'França', codigo: 'FRA', bandeira: '🇫🇷' }
const DEN = { id: 10, nome: 'Dinamarca', codigo: 'DEN', bandeira: '🇩🇰' }
const ENG = { id: 13, nome: 'Inglaterra', codigo: 'ENG', bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }
const USA = { id: 14, nome: 'Estados Unidos', codigo: 'USA', bandeira: '🇺🇸' }

const POR = { id: 17, nome: 'Portugal', codigo: 'POR', bandeira: '🇵🇹' }
const ESP = { id: 18, nome: 'Espanha', codigo: 'ESP', bandeira: '🇪🇸' }
const ALE = { id: 19, nome: 'Alemanha', codigo: 'GER', bandeira: '🇩🇪' }
const NED = { id: 20, nome: 'Holanda', codigo: 'NED', bandeira: '🇳🇱' }
const URU = { id: 21, nome: 'Uruguai', codigo: 'URU', bandeira: '🇺🇾' }
const MAR = { id: 22, nome: 'Marrocos', codigo: 'MAR', bandeira: '🇲🇦' }

export const chaveamentoMock: PartidaEliminatoria[] = [
  // Oitavas de final — algumas encerradas, algumas agendadas
  { id: 101, fase: 'oitavas', jogo: 1, data: '2026-07-01', hora: '13:00', selecao_casa: BRA, selecao_fora: POL, gols_casa: 3, gols_fora: 1, status: 'encerrada' },
  { id: 102, fase: 'oitavas', jogo: 2, data: '2026-07-01', hora: '17:00', selecao_casa: FRA, selecao_fora: USA, gols_casa: 2, gols_fora: 0, status: 'encerrada' },
  { id: 103, fase: 'oitavas', jogo: 3, data: '2026-07-02', hora: '13:00', selecao_casa: ARG, selecao_fora: DEN, gols_casa: 1, gols_fora: 1, penaltis_casa: 4, penaltis_fora: 3, status: 'encerrada' },
  { id: 104, fase: 'oitavas', jogo: 4, data: '2026-07-02', hora: '17:00', selecao_casa: ENG, selecao_fora: MAR, gols_casa: 1, gols_fora: 0, status: 'encerrada' },
  { id: 105, fase: 'oitavas', jogo: 5, data: '2026-07-03', hora: '13:00', selecao_casa: ESP, selecao_fora: MEX, gols_casa: null, gols_fora: null, status: 'agendada' },
  { id: 106, fase: 'oitavas', jogo: 6, data: '2026-07-03', hora: '17:00', selecao_casa: POR, selecao_fora: URU, gols_casa: null, gols_fora: null, status: 'agendada' },
  { id: 107, fase: 'oitavas', jogo: 7, data: '2026-07-04', hora: '13:00', selecao_casa: ALE, selecao_fora: AUS, gols_casa: null, gols_fora: null, status: 'agendada' },
  { id: 108, fase: 'oitavas', jogo: 8, data: '2026-07-04', hora: '17:00', selecao_casa: NED, selecao_fora: KSA, gols_casa: null, gols_fora: null, status: 'agendada' },

  // Quartas de final — a definir (aguarda oitavas)
  { id: 201, fase: 'quartas', jogo: 1, data: '2026-07-08', hora: '17:00', selecao_casa: BRA, selecao_fora: FRA, gols_casa: null, gols_fora: null, status: 'a_definir' },
  { id: 202, fase: 'quartas', jogo: 2, data: '2026-07-09', hora: '13:00', selecao_casa: ARG, selecao_fora: ENG, gols_casa: null, gols_fora: null, status: 'a_definir' },
  { id: 203, fase: 'quartas', jogo: 3, data: '2026-07-09', hora: '17:00', selecao_casa: null, selecao_fora: null, gols_casa: null, gols_fora: null, status: 'a_definir' },
  { id: 204, fase: 'quartas', jogo: 4, data: '2026-07-10', hora: '17:00', selecao_casa: null, selecao_fora: null, gols_casa: null, gols_fora: null, status: 'a_definir' },

  // Semifinais
  { id: 301, fase: 'semi', jogo: 1, data: '2026-07-14', hora: '17:00', selecao_casa: null, selecao_fora: null, gols_casa: null, gols_fora: null, status: 'a_definir' },
  { id: 302, fase: 'semi', jogo: 2, data: '2026-07-15', hora: '17:00', selecao_casa: null, selecao_fora: null, gols_casa: null, gols_fora: null, status: 'a_definir' },

  // Terceiro lugar
  { id: 401, fase: 'terceiro', jogo: 1, data: '2026-07-18', hora: '13:00', selecao_casa: null, selecao_fora: null, gols_casa: null, gols_fora: null, status: 'a_definir' },

  // Final
  { id: 501, fase: 'final', jogo: 1, data: '2026-07-19', hora: '16:00', selecao_casa: null, selecao_fora: null, gols_casa: null, gols_fora: null, status: 'a_definir' },
]

export const partidasMock: Partida[] = [
  // Rodada 1 — encerradas
  { id: 1, fase: 'Grupo A', data: '2026-06-11', hora: '13:00', selecao_casa: BRA, selecao_fora: SRB, gols_casa: 2, gols_fora: 0, status: 'encerrada' },
  { id: 2, fase: 'Grupo A', data: '2026-06-11', hora: '16:00', selecao_casa: MEX, selecao_fora: CMR, gols_casa: 1, gols_fora: 1, status: 'encerrada' },
  { id: 3, fase: 'Grupo B', data: '2026-06-12', hora: '13:00', selecao_casa: ARG, selecao_fora: KSA, gols_casa: 2, gols_fora: 1, status: 'encerrada' },
  { id: 4, fase: 'Grupo B', data: '2026-06-12', hora: '16:00', selecao_casa: POL, selecao_fora: AUS, gols_casa: 2, gols_fora: 0, status: 'encerrada' },
  { id: 5, fase: 'Grupo D', data: '2026-06-13', hora: '13:00', selecao_casa: ENG, selecao_fora: USA, gols_casa: 0, gols_fora: 0, status: 'encerrada' },

  // Rodada 2 — uma ao vivo
  { id: 6, fase: 'Grupo A', data: '2026-06-15', hora: '13:00', selecao_casa: BRA, selecao_fora: MEX, gols_casa: 3, gols_fora: 1, status: 'encerrada' },
  { id: 7, fase: 'Grupo B', data: '2026-06-15', hora: '16:00', selecao_casa: ARG, selecao_fora: POL, gols_casa: 2, gols_fora: 0, status: 'encerrada' },
  { id: 8, fase: 'Grupo C', data: '2026-06-16', hora: '19:00', selecao_casa: FRA, selecao_fora: DEN, gols_casa: 1, gols_fora: 0, status: 'ao_vivo', minuto: 67 },

  // Rodada 3 — agendadas
  { id: 9,  fase: 'Grupo A', data: '2026-06-19', hora: '16:00', selecao_casa: BRA, selecao_fora: CMR, gols_casa: null, gols_fora: null, status: 'agendada' },
  { id: 10, fase: 'Grupo A', data: '2026-06-19', hora: '16:00', selecao_casa: MEX, selecao_fora: SRB, gols_casa: null, gols_fora: null, status: 'agendada' },
  { id: 11, fase: 'Grupo B', data: '2026-06-20', hora: '16:00', selecao_casa: ARG, selecao_fora: AUS, gols_casa: null, gols_fora: null, status: 'agendada' },
  { id: 12, fase: 'Grupo D', data: '2026-06-21', hora: '19:00', selecao_casa: ENG, selecao_fora: USA, gols_casa: null, gols_fora: null, status: 'agendada' },
]
