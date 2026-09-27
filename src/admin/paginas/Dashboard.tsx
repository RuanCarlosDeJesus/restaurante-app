import clsx from 'clsx'
import { ArrowRight, Clock, PackageX, Receipt, ShoppingBag, TrendingUp, type LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ImagemPrato } from '../../components/ui/ImagemPrato'
import { api, usePedidos, useProdutos } from '../../services/db'
import { formatarPreco, tempoDecorrido } from '../../utils/formatar'
import { useSessao } from '../auth'
import { Cartao, InterruptorLoja } from '../ui'
import { corStatus, rotuloStatus } from '../status'

function saudacao() {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function Dashboard() {
  const sessao = useSessao()
  const pedidos = usePedidos()
  const produtos = useProdutos()

  const hoje = useMemo(() => {
    const inicio = new Date()
    inicio.setHours(0, 0, 0, 0)
    return pedidos.filter((p) => new Date(p.criadoEm) >= inicio)
  }, [pedidos])

  const validos = hoje.filter((p) => p.status !== 'cancelado')
  const faturamento = validos.reduce((soma, p) => soma + p.total, 0)
  const emAndamento = pedidos.filter((p) => ['novo', 'preparo', 'saiu'].includes(p.status)).length
  const esgotados = produtos.filter((p) => !p.disponivel)

  const maisVendidos = useMemo(() => {
    const contagem = new Map<string, { nome: string; quantidade: number }>()
    pedidos
      .filter((p) => p.status !== 'cancelado')
      .flatMap((p) => p.itens)
      .forEach((item) => {
        const atual = contagem.get(item.produtoId) ?? { nome: item.nome, quantidade: 0 }
        contagem.set(item.produtoId, { ...atual, quantidade: atual.quantidade + item.quantidade })
      })
    return [...contagem.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
  }, [pedidos])

  const indicadores: { rotulo: string; valor: string; icone: LucideIcon; cor: string }[] = [
    { rotulo: 'Pedidos hoje', valor: String(validos.length), icone: Receipt, cor: 'bg-orange-100 text-orange-600' },
    { rotulo: 'Faturamento hoje', valor: formatarPreco(faturamento), icone: TrendingUp, cor: 'bg-emerald-100 text-emerald-600' },
    {
      rotulo: 'Ticket médio',
      valor: formatarPreco(validos.length ? faturamento / validos.length : 0),
      icone: ShoppingBag,
      cor: 'bg-sky-100 text-sky-600',
    },
    { rotulo: 'Em andamento', valor: String(emAndamento), icone: Clock, cor: 'bg-amber-100 text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {saudacao()}, {sessao?.nome.split(' ')[0]}
        </h1>
      </div>

      <Cartao>
        <InterruptorLoja />
      </Cartao>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {indicadores.map(({ rotulo, valor, icone: Icone, cor }) => (
          <div key={rotulo} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-900/5 sm:p-5">
            <span className={clsx('grid size-10 place-items-center rounded-xl', cor)}>
              <Icone className="size-5" />
            </span>
            <p className="mt-4 truncate text-xl font-bold tabular-nums text-stone-900 sm:text-2xl">{valor}</p>
            <p className="text-xs font-medium text-stone-500 sm:text-sm">{rotulo}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Cartao
          titulo="Últimos pedidos"
          acao={
            <Link to="/admin/pedidos" className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          }
        >
          {pedidos.length === 0 ? (
            <p className="rounded-2xl bg-stone-50 p-6 text-center text-sm text-stone-500">
              Nenhum pedido ainda. Faça um teste pela loja em outra aba — ele aparece aqui na hora.
            </p>
          ) : (
            <ul className="-mx-2 divide-y divide-stone-100">
              {pedidos.slice(0, 6).map((pedido) => (
                <li key={pedido.id}>
                  <Link
                    to="/admin/pedidos"
                    className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-stone-50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-xs font-bold text-stone-600">
                      #{pedido.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{pedido.cliente.nome}</p>
                      <p className="text-xs text-stone-500">
                        {tempoDecorrido(pedido.criadoEm)} · {pedido.tipo === 'entrega' ? 'Entrega' : 'Retirada'}
                      </p>
                    </div>
                    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', corStatus[pedido.status])}>
                      {rotuloStatus(pedido.status, pedido.tipo)}
                    </span>
                    <span className="hidden w-24 text-right text-sm font-semibold tabular-nums sm:block">
                      {formatarPreco(pedido.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <div className="space-y-6">
          <Cartao titulo="Esgotados" descricao="Itens que o cliente vê, mas não consegue pedir">
            {esgotados.length === 0 ? (
              <p className="text-sm text-stone-500">Tudo disponível no momento. 🎉</p>
            ) : (
              <ul className="space-y-2">
                {esgotados.map((produto) => (
                  <li key={produto.id} className="flex items-center gap-3">
                    <span className="size-10 shrink-0 overflow-hidden rounded-lg grayscale">
                      <ImagemPrato imagem={produto.imagem} nome={produto.nome} categoria={produto.categoria} />
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{produto.nome}</span>
                    <button
                      onClick={async () => {
                        await api.atualizarProduto(produto.id, { disponivel: true })
                        toast.success(`${produto.nome} disponível novamente`)
                      }}
                      className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Repor
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {esgotados.length === 0 && (
              <p className="mt-3 flex items-center gap-2 text-xs text-stone-400">
                <PackageX className="size-3.5" /> Marque como esgotado na tela de Cardápio.
              </p>
            )}
          </Cartao>

          <Cartao titulo="Mais pedidos">
            {maisVendidos.length === 0 ? (
              <p className="text-sm text-stone-500">Aparece aqui quando os pedidos começarem a chegar.</p>
            ) : (
              <ol className="space-y-3">
                {maisVendidos.map((item, i) => (
                  <li key={item.nome} className="flex items-center gap-3 text-sm">
                    <span className="grid size-6 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-500">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate font-medium">{item.nome}</span>
                    <span className="text-stone-500 tabular-nums">{item.quantidade} un.</span>
                  </li>
                ))}
              </ol>
            )}
          </Cartao>
        </div>
      </div>
    </div>
  )
}
