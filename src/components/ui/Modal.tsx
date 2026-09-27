import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Drawer } from 'vaul'
import { useDesktop } from '../../hooks/useMediaQuery'

interface ModalProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  titulo: string
  children: ReactNode
  largura?: string
}

const botaoFechar =
  'absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/80 text-stone-600 shadow-sm ring-1 ring-stone-900/5 backdrop-blur transition hover:bg-white hover:text-stone-900'

/**
 * Modal responsivo: no desktop é um diálogo centralizado,
 * no celular vira um bottom-sheet que pode ser arrastado para fechar.
 */
export function Modal({ aberto, onAbertoChange, titulo, children, largura = 'max-w-md' }: ModalProps) {
  const desktop = useDesktop()

  if (desktop) {
    return (
      <Dialog.Root open={aberto} onOpenChange={onAbertoChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className={clsx(
              'modal-conteudo fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-stone-950/20 outline-none',
              largura,
            )}
          >
            <Dialog.Title className="sr-only">{titulo}</Dialog.Title>
            <Dialog.Close className={botaoFechar} aria-label="Fechar">
              <X className="size-4" />
            </Dialog.Close>
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  return (
    <Drawer.Root open={aberto} onOpenChange={onAbertoChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-4xl bg-white outline-none"
        >
          <div className="absolute inset-x-0 top-2 z-10 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-stone-300/90" />
          </div>
          <Drawer.Title className="sr-only">{titulo}</Drawer.Title>
          <Drawer.Close className={botaoFechar} aria-label="Fechar">
            <X className="size-4" />
          </Drawer.Close>
          <div className="overflow-y-auto pb-[env(safe-area-inset-bottom)]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
