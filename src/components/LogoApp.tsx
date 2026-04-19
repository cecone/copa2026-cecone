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

function BolaSvg({ tamanho = 'md' }: { tamanho?: Tamanho }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className={TAMANHOS[tamanho]}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ballGlow" cx="38%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#1a4fd6" />
          <stop offset="100%" stopColor="#002580" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#ballGlow)" stroke="#F5A623" strokeWidth="3" />
      <line x1="40" y1="14" x2="62" y2="27" stroke="#F5A623" strokeWidth="1.5" opacity="0.45" />
      <line x1="62" y1="27" x2="54" y2="54" stroke="#F5A623" strokeWidth="1.5" opacity="0.45" />
      <line x1="54" y1="54" x2="26" y2="54" stroke="#F5A623" strokeWidth="1.5" opacity="0.45" />
      <line x1="26" y1="54" x2="18" y2="27" stroke="#F5A623" strokeWidth="1.5" opacity="0.45" />
      <line x1="18" y1="27" x2="40" y2="14" stroke="#F5A623" strokeWidth="1.5" opacity="0.45" />
      <circle cx="40" cy="14" r="3" fill="#F5A623" />
      <circle cx="62" cy="27" r="3" fill="#F5A623" />
      <circle cx="54" cy="54" r="3" fill="#F5A623" />
      <circle cx="26" cy="54" r="3" fill="#F5A623" />
      <circle cx="18" cy="27" r="3" fill="#F5A623" />
      <text
        x="40" y="50"
        textAnchor="middle"
        fill="#F5A623"
        fontSize="26"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="-1"
      >
        26
      </text>
    </svg>
  )
}

export default function LogoApp({ tamanho = 'md', comTexto = true, horizontal = false }: Props) {
  if (horizontal) {
    return (
      <div className="flex items-center gap-2 select-none">
        <BolaSvg tamanho="sm" />
        <span className="font-black text-[var(--copa-gold)] tracking-tight leading-none">
          Copa 2026{' '}
          <span className="text-white/50 font-semibold text-sm">do Cecone</span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <BolaSvg tamanho={tamanho} />
      {comTexto && (
        <div className="text-center leading-tight">
          <div className={`font-black text-white tracking-tight ${
            tamanho === 'lg' ? 'text-3xl' : tamanho === 'sm' ? 'text-base' : 'text-2xl'
          }`}>
            Copa 2026
          </div>
          <div className={`font-semibold text-[var(--copa-gold)] ${
            tamanho === 'lg' ? 'text-base' : 'text-xs'
          }`}>
            do Cecone
          </div>
        </div>
      )}
    </div>
  )
}
