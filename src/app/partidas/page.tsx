import LogoApp from '@/components/LogoApp'
import { createClient } from '@/lib/supabase-server'
import CardPartida from '@/components/CardPartida'
import { Partida } from '@/types'
import Link from 'next/link'

export const revalidate = 30 // revalida a cada 30 segundos

function formatarData(dataStr: string) {
  const data = new Date(dataStr)
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function rowToPartida(row: SupabasePartida): Partida {
  const selCasa = Array.isArray(row.selecao_casa) ? row.selecao_casa[0] : row.selecao_casa
  const selFora = Array.isArray(row.selecao_fora) ? row.selecao_fora[0] : row.selecao_fora
  const dt = new Date(row.data_hora)
  return {
    id: row.id,
    fase: row.fase,
    data: dt.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
    hora: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
    selecao_casa: selCasa
      ? { id: selCasa.id, nome: selCasa.nome, codigo: selCasa.codigo, bandeira: selCasa.bandeira }
      : { id: 0, nome: 'A definir', codigo: '?', bandeira: '❓' },
    selecao_fora: selFora
      ? { id: selFora.id, nome: selFora.nome, codigo: selFora.codigo, bandeira: selFora.bandeira }
      : { id: 0, nome: 'A definir', codigo: '?', bandeira: '❓' },
    gols_casa: row.gols_casa,
    gols_fora: row.gols_fora,
    status: row.status as Partida['status'],
    minuto: row.minuto ?? undefined,
  }
}

type SelecaoRow = { id: number; nome: string; codigo: string; bandeira: string }
type SupabasePartida = {
  id: number; fase: string; data_hora: string;
  gols_casa: number | null; gols_fora: number | null;
  status: string; minuto: number | null;
  selecao_casa: SelecaoRow | SelecaoRow[] | null
  selecao_fora: SelecaoRow | SelecaoRow[] | null
}

export default async function PartidasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('partidas')
    .select(`
      id, fase, data_hora, gols_casa, gols_fora, status, minuto,
      selecao_casa:selecao_casa_id(id, nome, codigo, bandeira),
      selecao_fora:selecao_fora_id(id, nome, codigo, bandeira)
    `)
    .eq('fase_tipo', 'grupos')
    .order('data_hora', { ascending: true })

  const partidas = (data ?? []).map(row => rowToPartida(row as unknown as SupabasePartida))

  // Separar ao vivo
  const aoVivo = partidas.filter(p => p.status === 'ao_vivo')

  // Agrupar por data
  const porData = partidas.reduce<Record<string, Partida[]>>((acc, p) => {
    if (!acc[p.data]) acc[p.data] = []
    acc[p.data].push(p)
    return acc
  }, {})
  const datas = Object.keys(porData).sort()

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Início
          </Link>
          <LogoApp horizontal />
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Partidas</h2>

        {partidas.length === 0 && (
          <p className="text-white/40 text-center py-16">
            Os jogos ainda não foram carregados.
          </p>
        )}

        {/* Ao vivo */}
        {aoVivo.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--copa-red)] animate-pulse"></span>
              <span className="text-sm font-bold text-[var(--copa-red)] uppercase tracking-wider">Ao vivo agora</span>
            </div>
            <div className="flex flex-col gap-3">
              {aoVivo.map(p => <CardPartida key={p.id} partida={p} />)}
            </div>
          </div>
        )}

        {/* Por data */}
        {datas.map(data => (
          <div key={data} className="mb-8">
            <h3 className="text-sm text-white/40 font-semibold uppercase tracking-wider mb-3 capitalize">
              {formatarData(data)}
            </h3>
            <div className="flex flex-col gap-3">
              {porData[data].map(p => <CardPartida key={p.id} partida={p} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
