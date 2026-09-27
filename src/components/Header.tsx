import clsx from 'clsx'
import { ChefHat, ReceiptText, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCarrinho } from '../context/CarrinhoContext'
import { useConfig } from '../services/db'
import type { Pedido } from '../types'
import { formatarPreco } from '../utils/formatar'
import { useStatusLoja } from '../utils/horario'

interface HeaderProps {
  pedidoAtivo: Pedido | null
  onAbrirCarrinho: () => void
  onAbrirPedido: () => void
}

export function Header({ pedidoAtivo, onAbrirCarrinho, onAbrirPedido }: HeaderProps) {
  const config = useConfig()
  const status = useStatusLoja()
  const { quantidadeTotal, subtotal } = useCarrinho()

  return (
    <header className="sticky top-0 z-40 border-b border-stone-900/5 bg-creme/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30">
            <ChefHat className="size-5" />
          </span>
          <span className="truncate font-display text-xl font-semibold tracking-tight">{config.nome}</span>
        </a>

        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold md:flex',
              status.aberta ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
            )}
          >
            <span className={clsx('size-2 rounded-full', status.aberta ? 'bg-emerald-500' : 'bg-red-500')} />
            {status.texto} · <span className="font-medium opacity-80">{status.detalhe}</span>
          </span>

          {pedidoAtivo && (
            <button
              onClick={onAbrirPedido}
              className="flex h-10 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-900/10 transition hover:bg-stone-50"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-orange-500" />
              </span>
              <ReceiptText className="size-4 sm:hidden" />
              <span className="hidden sm:inline">Pedido #{pedidoAtivo.numero}</span>
            </button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAbrirCarrinho}
            aria-label="Abrir carrinho"
            className="relative flex h-10 items-center gap-2 rounded-full bg-stone-900 pl-3.5 pr-4 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 transition-colors hover:bg-stone-800"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">
              {quantidadeTotal > 0 ? formatarPreco(subtotal) : 'Carrinho'}
            </span>
            <AnimatePresence>
              {quantidadeTotal > 0 && (
                <motion.span
                  key={quantidadeTotal}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-orange-500 text-[11px] font-bold ring-2 ring-creme"
                >
                  {quantidadeTotal}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  )
}
