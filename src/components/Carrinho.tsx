import clsx from 'clsx'
import { AlertCircle, ArrowRight, Bike, Minus, Moon, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { Drawer } from 'vaul'
import { useCarrinho } from '../context/CarrinhoContext'
import { useDesktop } from '../hooks/useMediaQuery'
import { useConfig } from '../services/db'
import { formatarPreco } from '../utils/formatar'
import { useStatusLoja } from '../utils/horario'
import { ImagemPrato } from './ui/ImagemPrato'

interface CarrinhoProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onContinuar: () => void
}

export function Carrinho({ aberto, onAbertoChange, onContinuar }: CarrinhoProps) {
  const desktop = useDesktop()
  const config = useConfig()
  const status = useStatusLoja()
  const { itens, alterarQuantidade, remover, subtotal, quantidadeTotal } = useCarrinho()

  const limiteFrete = config.aceitaEntrega ? config.freteGratisAcima : null
  const freteGratis = limiteFrete !== null && subtotal >= limiteFrete
  const faltaMinimo = config.pedidoMinimo - subtotal
  const podeContinuar = status.aberta && faltaMinimo <= 0

  return (
    <Drawer.Root open={aberto} onOpenChange={onAbertoChange} direction={desktop ? 'right' : 'bottom'}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          style={desktop ? ({ '--initial-transform': 'calc(100% + 12px)' } as CSSProperties) : undefined}
          className={clsx(
            'fixed z-50 flex flex-col bg-creme outline-none',
            desktop
              ? 'inset-y-3 right-3 w-105 rounded-3xl shadow-2xl'
              : 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-4xl',
          )}
        >
          {!desktop && <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-stone-300" />}

          <div className="flex items-center justify-between px-6 pb-4 pt-5">
            <div>
              <Drawer.Title className="font-display text-2xl font-semibold tracking-tight">
                Seu pedido
              </Drawer.Title>
              <p className="text-sm text-stone-500">
                {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <Drawer.Close
              aria-label="Fechar carrinho"
              className="grid size-10 place-items-center rounded-full bg-white text-stone-600 shadow-sm ring-1 ring-stone-900/5 transition hover:text-stone-900"
            >
              <X className="size-4" />
            </Drawer.Close>
          </div>

          {itens.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-6 text-center">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="grid size-20 place-items-center rounded-full bg-orange-100 text-orange-600"
              >
                <ShoppingBag className="size-9" />
              </motion.span>
              <p className="mt-5 font-display text-xl font-semibold">Seu carrinho está vazio</p>
              <p className="mt-1 max-w-60 text-sm text-stone-500">
                Adicione itens do cardápio para montar seu pedido.
              </p>
              <Drawer.Close className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800">
                Ver cardápio
                <ArrowRight className="size-4" />
              </Drawer.Close>
            </div>
          ) : (
            <>
              {limiteFrete !== null && (
                <div className="mx-6 mb-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-900/5">
                  <p className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <Bike className="size-4 text-orange-500" />
                    {freteGratis ? (
                      <span>
                        Você ganhou <b className="text-emerald-600">frete grátis</b>!
                      </span>
                    ) : (
                      <span>
                        Faltam <b>{formatarPreco(limiteFrete - subtotal)}</b> para frete grátis
                      </span>
                    )}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
                    <motion.div
                      className={clsx(
                        'h-full rounded-full',
                        freteGratis ? 'bg-emerald-500' : 'bg-linear-to-r from-orange-400 to-orange-600',
                      )}
                      initial={false}
                      animate={{ width: `${Math.min(subtotal / limiteFrete, 1) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>
              )}

              <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-2">
                <AnimatePresence initial={false}>
                  {itens.map((item) => (
                    <motion.li
                      key={item.chave}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-900/5"
                    >
                      <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                        <ImagemPrato imagem={item.imagem} nome={item.nome} categoria={item.categoria} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900">{item.nome}</p>
                        <p className="truncate text-xs text-stone-500">
                          {[item.tamanho.nome, ...item.adicionais.map((a) => `+ ${a.nome}`)].join(' · ')}
                        </p>
                        <p className="text-sm font-semibold text-orange-600 tabular-nums">
                          {formatarPreco(item.precoUnitario * item.quantidade)}
                        </p>

                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full bg-stone-100 p-0.5">
                            <button
                              onClick={() => alterarQuantidade(item.chave, item.quantidade - 1)}
                              aria-label="Diminuir"
                              className="grid size-7 place-items-center rounded-full text-stone-600 transition hover:bg-white"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold tabular-nums">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => alterarQuantidade(item.chave, item.quantidade + 1)}
                              aria-label="Aumentar"
                              className="grid size-7 place-items-center rounded-full text-stone-600 transition hover:bg-white"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => remover(item.chave)}
                            aria-label={`Remover ${item.nome}`}
                            className="grid size-8 place-items-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <div className="mt-2 border-t border-stone-900/5 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:rounded-b-3xl">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-stone-500">Subtotal</span>
                  <span className="font-display text-2xl font-semibold tabular-nums">
                    {formatarPreco(subtotal)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-stone-400">Taxa de entrega calculada no próximo passo</p>

                {!status.aberta ? (
                  <Aviso icone={Moon}>Loja fechada · {status.detalhe}</Aviso>
                ) : (
                  faltaMinimo > 0 && (
                    <Aviso icone={AlertCircle}>
                      Pedido mínimo de {formatarPreco(config.pedidoMinimo)} — faltam{' '}
                      {formatarPreco(faltaMinimo)}
                    </Aviso>
                  )
                )}

                <motion.button
                  whileTap={podeContinuar ? { scale: 0.98 } : undefined}
                  onClick={onContinuar}
                  disabled={!podeContinuar}
                  className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-orange-600 text-sm font-semibold text-white shadow-xl shadow-orange-600/30 transition-colors hover:bg-orange-700 disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none"
                >
                  Continuar
                  <ArrowRight className="size-4" />
                </motion.button>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function Aviso({ icone: Icone, children }: { icone: typeof Moon; children: ReactNode }) {
  return (
    <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
      <Icone className="size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
