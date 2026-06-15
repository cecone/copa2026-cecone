type Tamanho = 'sm' | 'md' | 'lg'

type Props = {
  tamanho?: Tamanho
  /** true = ícone + texto empilhados (padrão), false = só ícone */
  comTexto?: boolean
  /** true = ícone + texto lado a lado (para cabeçalhos internos) */
  horizontal?: boolean
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
}

// Roundel: círculo central do campo — disco de gramado, aro dourado,
// linha de meio-campo, círculo central e marca do centro.
function RoundelSvg({ tamanho = 'md' }: { tamanho?: Tamanho }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className={TAMANHOS[tamanho]}
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="37" fill="#0E2A1C" stroke="#F4B740" strokeWidth="3.5" />
      <line x1="40" y1="8" x2="40" y2="72" stroke="#F4B740" strokeWidth="2.4" opacity="0.95" />
      <circle cx="40" cy="40" r="14" fill="none" stroke="#F4B740" strokeWidth="3" />
      <circle cx="40" cy="40" r="3.4" fill="#F4B740" />
    </svg>
  )
}

export default function LogoApp({ tamanho = 'md', comTexto = true, horizontal = false }: Props) {
  if (horizontal) {
    return (
      <div className="flex items-center gap-2.5 select-none">
        <RoundelSvg tamanho="sm" />
        <span className="leading-none">
          <span className="font-display text-lg font-bold uppercase text-[var(--chalk)]">Copa 2026</span>{' '}
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--copa-gold)]">
            do Cecone
          </span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <RoundelSvg tamanho={tamanho} />
      {comTexto && (
        <div className="text-center leading-none">
          <div
            className={`font-display font-bold uppercase tracking-wide text-[var(--chalk)] ${
              tamanho === 'lg' ? 'text-4xl' : tamanho === 'sm' ? 'text-lg' : 'text-2xl'
            }`}
          >
            Copa 2026
          </div>
          <div
            className={`mt-1.5 font-display font-semibold uppercase tracking-[0.25em] text-[var(--copa-gold)] ${
              tamanho === 'lg' ? 'text-xs' : 'text-[10px]'
            }`}
          >
            do Cecone
          </div>
        </div>
      )}
    </div>
  )
}
