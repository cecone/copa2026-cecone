import { urlBandeira } from '@/lib/emoji-bandeiras'

type Tamanho = 'sm' | 'md' | 'lg' | 'xl'

const TAMANHOS: Record<Tamanho, { img: string; emoji: string }> = {
  sm:  { img: 'w-5 h-3.5',  emoji: 'text-base' },
  md:  { img: 'w-7 h-5',    emoji: 'text-2xl'  },
  lg:  { img: 'w-9 h-6',    emoji: 'text-3xl'  },
  xl:  { img: 'w-11 h-8',   emoji: 'text-4xl'  },
}

type Props = {
  codigo: string
  emoji: string
  nome: string
  tamanho?: Tamanho
}

export default function Bandeira({ codigo, emoji, nome, tamanho = 'md' }: Props) {
  const url = urlBandeira(codigo)
  const t = TAMANHOS[tamanho]

  if (url) {
    return (
      <img
        src={url}
        alt={nome}
        className={`${t.img} object-cover rounded-sm shrink-0`}
        loading="lazy"
      />
    )
  }

  // Fallback: emoji (funciona bem no Mac/iOS)
  return <span className={`${t.emoji} leading-none`}>{emoji}</span>
}
