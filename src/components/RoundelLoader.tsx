type Tamanho = 'sm' | 'md' | 'lg'

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
}

// Roundel animado: o ponteiro dourado varre o disco como um radar.
// Respeita prefers-reduced-motion (para de girar se o usuário pedir menos movimento).
export default function RoundelLoader({
  tamanho = 'md',
  label = 'Carregando',
}: {
  tamanho?: Tamanho
  label?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className={TAMANHOS[tamanho]}
      role="img"
      aria-label={label}
    >
      <style>{`
        @keyframes roundelSweep { to { transform: rotate(360deg); } }
        .roundel-sweep {
          transform-box: view-box;
          transform-origin: 40px 40px;
          animation: roundelSweep 1.5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .roundel-sweep { animation: none; }
        }
      `}</style>

      {/* Disco + aro */}
      <circle cx="40" cy="40" r="37" fill="#0E2A1C" stroke="#F4B740" strokeWidth="3.5" />
      {/* Círculo central (apagado, deixa o ponteiro ser o foco) */}
      <circle cx="40" cy="40" r="14" fill="none" stroke="#F4B740" strokeWidth="3" opacity="0.4" />
      <circle cx="40" cy="40" r="3.4" fill="#F4B740" />

      {/* Ponteiro que varre */}
      <g className="roundel-sweep">
        <path d="M40,40 L40,5 A35,35 0 0 0 13,18 Z" fill="#F4B740" opacity="0.16" />
        <line x1="40" y1="40" x2="40" y2="5" stroke="#F4B740" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="5" r="3" fill="#F4B740" />
      </g>
    </svg>
  )
}
