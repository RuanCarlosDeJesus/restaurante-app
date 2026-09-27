import clsx from 'clsx'
import { LayoutGrid, Moon, Plus, Search, SearchX, X, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { categorias } from '../data/seed'
import { useProdutos } from '../services/db'
import type { Categoria, Produto } from '../types'
import { formatarPreco, precoMinimo, produtoSimples } from '../utils/formatar'
import { useStatusLoja } from '../utils/horario'
import { ImagemPrato, iconesCategoria } from './ui/ImagemPrato'

interface CardapioProps {
  onSelecionarPrato: (produto: Produto) => void
  onAdicionarRapido: (produto: Produto) => void
}

type Filtro = Categoria | 'todos'

const iconeFiltro = (filtro: Filtro): LucideIcon =>
  filtro === 'todos' ? LayoutGrid : iconesCategoria[filtro]

export function Cardapio({ onSelecionarPrato, onAdicionarRapido }: CardapioProps) {
  const produtos = useProdutos()
  const status = useStatusLoja()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')

  const visiveis = useMemo(() => produtos.filter((p) => p.visivel), [produtos])

  const filtros = useMemo(
    () => [
      { valor: 'todos' as Filtro, rotulo: 'Todos' },
      ...categorias.filter((c) => visiveis.some((p) => p.categoria === c.valor)),
    ],
    [visiveis],
  )

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const ordem = categorias.map((c) => c.valor)
    return visiveis
      .filter(
        (p) =>
          (filtro === 'todos' || p.categoria === filtro) &&
          (!termo || p.nome.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo)),
      )
      .sort(
        (a, b) =>
          Number(b.disponivel) - Number(a.disponivel) ||
          ordem.indexOf(a.categoria) - ordem.indexOf(b.categoria),
      )
  }, [visiveis, filtro, busca])

  return (
    <section id="cardapio" className="mx-auto max-w-6xl scroll-mt-16 px-4 pb-32 pt-6 sm:px-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Cardápio</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            O que vai ser hoje?
          </h2>
        </div>

        <label className="relative block w-full sm:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar no cardápio..."
            className="h-12 w-full rounded-full border-0 bg-white pl-11 pr-10 text-sm shadow-sm ring-1 ring-stone-900/10 outline-none transition placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      {!status.aberta && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-stone-900 px-4 py-3 text-sm text-white">
          <Moon className="size-5 shrink-0 text-amber-300" />
          <p>
            <b>Estamos fechados agora.</b>{' '}
            <span className="text-stone-300">{status.detalhe}. Você já pode ir montando seu pedido.</span>
          </p>
        </div>
      )}

      <div className="sticky top-16 z-30 -mx-4 mb-6 bg-creme/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
          {filtros.map(({ valor, rotulo }) => {
            const Icone = iconeFiltro(valor)
            const ativo = filtro === valor
            return (
              <button
                key={valor}
                onClick={() => setFiltro(valor)}
                className={clsx(
                  'relative flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
                  ativo ? 'text-white' : 'bg-white text-stone-600 ring-1 ring-stone-900/10 hover:text-stone-900',
                )}
              >
                {ativo && (
                  <motion.span
                    layoutId="filtro-ativo"
                    className="absolute inset-0 rounded-full bg-stone-900 shadow-lg shadow-stone-900/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icone className="relative size-4" />
                <span className="relative">{rotulo}</span>
              </button>
            )
          })}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {produtosFiltrados.map((produto, indice) => (
            <CartaoProduto
              key={produto.id}
              produto={produto}
              indice={indice}
              onAbrir={() => onSelecionarPrato(produto)}
              onMais={() =>
                produtoSimples(produto) ? onAdicionarRapido(produto) : onSelecionarPrato(produto)
              }
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {produtosFiltrados.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-20 text-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white text-stone-400 shadow-sm ring-1 ring-stone-900/5">
            <SearchX className="size-7" />
          </span>
          <p className="mt-4 font-semibold text-stone-800">Nada encontrado</p>
          <p className="mt-1 text-sm text-stone-500">Tente outro termo ou categoria.</p>
        </motion.div>
      )}
    </section>
  )
}

interface CartaoProdutoProps {
  produto: Produto
  indice: number
  onAbrir: () => void
  onMais: () => void
}

function CartaoProduto({ produto, indice, onAbrir, onMais }: CartaoProdutoProps) {
  const esgotado = !produto.disponivel
  const variosTamanhos = produto.tamanhos.length > 1

  function mais(evento: MouseEvent) {
    evento.stopPropagation()
    onMais()
  }

  function teclado(evento: KeyboardEvent) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      onAbrir()
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(indice * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onClick={onAbrir}
      onKeyDown={teclado}
      role="button"
      tabIndex={0}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-900/5 outline-none transition-shadow duration-300 hover:shadow-2xl hover:shadow-stone-900/10 focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <div className={clsx('relative aspect-4/3 overflow-hidden', esgotado && 'grayscale')}>
        <ImagemPrato
          imagem={produto.imagem}
          nome={produto.nome}
          categoria={produto.categoria}
          iconeGrande
          className="transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1.5 p-3">
          {esgotado ? (
            <span className="rounded-full bg-stone-900/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
              Esgotado
            </span>
          ) : (
            produto.selos.map((selo) => (
              <span
                key={selo}
                className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-800 shadow-sm backdrop-blur"
              >
                {selo}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-stone-900">{produto.nome}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500">
          {produto.descricao}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {variosTamanhos && <p className="text-xs font-medium text-stone-400">a partir de</p>}
            <p className={clsx('font-display text-2xl font-semibold', esgotado ? 'text-stone-400' : 'text-stone-900')}>
              {formatarPreco(precoMinimo(produto))}
            </p>
            {variosTamanhos && (
              <p className="mt-0.5 truncate text-xs text-stone-400">
                {produto.tamanhos.map((t) => t.nome).join(' · ')}
              </p>
            )}
          </div>
          <motion.button
            whileTap={esgotado ? undefined : { scale: 0.85 }}
            onClick={mais}
            disabled={esgotado}
            aria-label={`Adicionar ${produto.nome}`}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-600/30 transition-colors hover:bg-orange-700 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
          >
            <Plus className="size-5" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
