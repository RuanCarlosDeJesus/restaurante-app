import clsx from 'clsx'
import { ArrowRight, Bike, Clock, ShoppingBag, Store } from 'lucide-react'
import { motion } from 'motion/react'
import { useConfig } from '../services/db'
import { formatarPreco } from '../utils/formatar'
import { useStatusLoja } from '../utils/horario'

const imagemHero =
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&q=80&auto=format&fit=crop'

export function Hero() {
  const config = useConfig()
  const status = useStatusLoja()

  const informacoes = [
    config.aceitaEntrega && { icone: Clock, valor: config.tempoEntrega, rotulo: 'tempo de entrega' },
    config.aceitaEntrega && {
      icone: Bike,
      valor: config.taxaEntrega === 0 ? 'Grátis' : formatarPreco(config.taxaEntrega),
      rotulo: 'taxa de entrega',
    },
    config.pedidoMinimo > 0 && {
      icone: ShoppingBag,
      valor: formatarPreco(config.pedidoMinimo),
      rotulo: 'pedido mínimo',
    },
    config.aceitaRetirada &&
      !config.aceitaEntrega && { icone: Store, valor: 'Retirada', rotulo: 'no balcão' },
  ].filter(Boolean) as { icone: typeof Clock; valor: string; rotulo: string }[]

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-32 -top-32 size-112 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-40 size-80 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className={clsx(
              'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-stone-900/5',
              status.aberta ? 'text-stone-700' : 'text-red-700',
            )}
          >
            <span className="relative flex size-2">
              {status.aberta && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={clsx(
                  'relative inline-flex size-2 rounded-full',
                  status.aberta ? 'bg-emerald-500' : 'bg-red-500',
                )}
              />
            </span>
            {status.texto} · {status.detalhe}
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
            Batata, frango e <span className="italic text-orange-600">o almoço de todo dia.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg">
            Porções caprichadas, batata a metro, frango assado na brasa e prato feito caseiro. Peça em
            poucos toques e receba quentinho.
          </p>

          <div className="mt-8">
            <a
              href="#cardapio"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-orange-600 px-6 text-sm font-semibold text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-700"
            >
              Ver cardápio
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {informacoes.length > 0 && (
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-stone-900/10 pt-6">
              {informacoes.map(({ icone: Icone, valor, rotulo }) => (
                <div key={rotulo}>
                  <dt className="flex items-center gap-1.5 text-lg font-bold text-stone-900">
                    <Icone className="size-4 shrink-0 text-orange-500" />
                    <span className="truncate">{valor}</span>
                  </dt>
                  <dd className="mt-0.5 text-xs text-stone-500">{rotulo}</dd>
                </div>
              ))}
            </dl>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative mx-auto w-full max-w-72 sm:max-w-md"
        >
          <div className="aspect-square rotate-3 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-orange-900/20 ring-8 ring-white">
            <img src={imagemHero} alt="Porção de batata frita" className="size-full object-cover" />
          </div>

          {config.aceitaEntrega && config.freteGratisAcima !== null && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-2 bottom-8 flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-xl backdrop-blur sm:-left-8"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <Bike className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-900">Frete grátis</p>
                <p className="text-xs text-stone-500">acima de {formatarPreco(config.freteGratisAcima)}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
