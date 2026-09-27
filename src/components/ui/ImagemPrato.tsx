import clsx from 'clsx'
import { CookingPot, CupSoda, Drumstick, Flame, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { Categoria } from '../../types'

export const iconesCategoria: Record<Categoria, LucideIcon> = {
  batatas: Flame,
  porcoes: UtensilsCrossed,
  frangos: Drumstick,
  almoco: CookingPot,
  bebidas: CupSoda,
}

interface ImagemPratoProps {
  imagem: string | null
  nome: string
  categoria: Categoria
  className?: string
  iconeGrande?: boolean
}

/** Foto do produto; sem foto (ou se falhar), mostra um placeholder com o ícone da categoria. */
export function ImagemPrato({ imagem, nome, categoria, className, iconeGrande }: ImagemPratoProps) {
  const [status, setStatus] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const Icone = iconesCategoria[categoria]
  const semFoto = !imagem || status === 'erro'

  return (
    <div className="relative size-full overflow-hidden bg-linear-to-br from-orange-100 via-amber-50 to-orange-50">
      {status !== 'ok' && (
        <div
          className={clsx(
            'absolute inset-0 grid place-items-center text-orange-300',
            !semFoto && 'animate-pulse',
          )}
        >
          <Icone className={iconeGrande ? 'size-14' : 'size-8'} strokeWidth={1.5} />
        </div>
      )}
      {!semFoto && (
        <img
          src={imagem}
          alt={nome}
          loading="lazy"
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('erro')}
          className={clsx(
            'size-full object-cover transition-opacity duration-500',
            status === 'ok' ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}
    </div>
  )
}
