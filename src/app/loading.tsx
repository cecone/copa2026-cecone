import RoundelLoader from '@/components/RoundelLoader'

// Coloque em app/loading.tsx (ou em qualquer pasta de rota, ex: app/grupos/loading.tsx).
// O Next.js mostra isto automaticamente enquanto a página carrega.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <RoundelLoader tamanho="lg" />
    </div>
  )
}
