import clsx from 'clsx'
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ImagemPrato } from '../../components/ui/ImagemPrato'
import { categorias } from '../../data/seed'
import { api, useProdutos } from '../../services/db'
import type { Categoria, Produto } from '../../types'
import { formatarPreco } from '../../utils/formatar'
import { Confirmar, Switch, TituloPagina } from '../ui'

export default function CardapioAdmin() {
  const produtos = useProdutos()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Categoria | 'todos'>('todos')
  const [removendo, setRemovendo] = useState<Produto | null>(null)

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return categorias
      .filter((c) => filtro === 'todos' || c.valor === filtro)
      .map((c) => ({
        ...c,
        produtos: produtos.filter(
          (p) => p.categoria === c.valor && (!termo || p.nome.toLowerCase().includes(termo)),
        ),
      }))
      .filter((g) => g.produtos.length > 0)
  }, [produtos, busca, filtro])

  async function alternarDisponivel(produto: Produto) {
    await api.atualizarProduto(produto.id, { disponivel: !produto.disponivel })
    toast.success(produto.disponivel ? `${produto.nome} marcado como esgotado` : `${produto.nome} disponível`)
  }

  async function alternarVisivel(produto: Produto) {
    await api.atualizarProduto(produto.id, { visivel: !produto.visivel })
    toast.success(produto.visivel ? `${produto.nome} escondido da loja` : `${produto.nome} visível na loja`)
  }

  return (
    <div>
      <TituloPagina
        titulo="Cardápio"
        descricao={`${produtos.length} produtos · ${produtos.filter((p) => !p.disponivel).length} esgotados`}
        acao={
          <Link
            to="/admin/cardapio/novo"
            className="flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
          >
            <Plus className="size-4" /> Novo produto
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-3 text-sm shadow-sm ring-1 ring-stone-900/10 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {[{ valor: 'todos' as const, rotulo: 'Todos' }, ...categorias].map((c) => (
            <button
              key={c.valor}
              onClick={() => setFiltro(c.valor)}
              className={clsx(
                'h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition',
                filtro === c.valor ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-900/10 hover:bg-stone-50',
              )}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {grupos.map((grupo) => (
          <section key={grupo.valor}>
            <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {grupo.rotulo} <span className="text-stone-400">· {grupo.produtos.length}</span>
            </h2>
            <ul className="divide-y divide-stone-100 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-900/5">
              {grupo.produtos.map((produto) => (
                <motion.li layout key={produto.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                  <Link
                    to={`/admin/cardapio/${produto.id}`}
                    className={clsx(
                      'size-14 shrink-0 overflow-hidden rounded-xl sm:size-16',
                      (!produto.disponivel || !produto.visivel) && 'opacity-50 grayscale',
                    )}
                  >
                    <ImagemPrato
                      key={produto.imagem}
                      imagem={produto.imagem}
                      nome={produto.nome}
                      categoria={produto.categoria}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/cardapio/${produto.id}`}
                      className="flex items-center gap-2 truncate font-semibold text-stone-900 hover:text-orange-600"
                    >
                      <span className="truncate">{produto.nome}</span>
                      {!produto.visivel && (
                        <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                          Oculto
                        </span>
                      )}
                      {!produto.disponivel && (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                          Esgotado
                        </span>
                      )}
                    </Link>
                    <p className="truncate text-sm text-stone-500">
                      {produto.tamanhos.map((t) => `${t.nome} ${formatarPreco(t.preco)}`).join(' · ')}
                    </p>
                    {!produto.imagem && <p className="text-xs text-amber-600">Sem foto</p>}
                  </div>

                  <div className="flex items-center gap-1 sm:gap-3">
                    <label className="hidden items-center gap-2 text-xs font-medium text-stone-500 sm:flex">
                      {produto.disponivel ? 'Disponível' : 'Esgotado'}
                      <Switch
                        ligado={produto.disponivel}
                        onChange={() => alternarDisponivel(produto)}
                        rotulo="Disponível"
                        tamanho="sm"
                      />
                    </label>
                    <span className="sm:hidden">
                      <Switch
                        ligado={produto.disponivel}
                        onChange={() => alternarDisponivel(produto)}
                        rotulo="Disponível"
                        tamanho="sm"
                      />
                    </span>
                    <button
                      onClick={() => alternarVisivel(produto)}
                      aria-label={produto.visivel ? 'Esconder da loja' : 'Mostrar na loja'}
                      title={produto.visivel ? 'Esconder da loja' : 'Mostrar na loja'}
                      className="hidden size-9 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 sm:grid"
                    >
                      {produto.visivel ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    <Link
                      to={`/admin/cardapio/${produto.id}`}
                      aria-label="Editar"
                      className="grid size-9 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      onClick={() => setRemovendo(produto)}
                      aria-label="Excluir"
                      className="hidden size-9 place-items-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600 sm:grid"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </section>
        ))}

        {grupos.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-stone-500 shadow-sm ring-1 ring-stone-900/5">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      <Confirmar
        aberto={removendo !== null}
        onAbertoChange={(aberto) => !aberto && setRemovendo(null)}
        titulo={`Excluir "${removendo?.nome}"?`}
        mensagem="O produto some da loja e do painel. Se quiser só tirar do ar por um tempo, use “esconder” ou “esgotado”."
        textoConfirmar="Excluir"
        perigo
        onConfirmar={async () => {
          if (!removendo) return
          await api.removerProduto(removendo.id)
          toast.success(`${removendo.nome} excluído`)
        }}
      />
    </div>
  )
}
