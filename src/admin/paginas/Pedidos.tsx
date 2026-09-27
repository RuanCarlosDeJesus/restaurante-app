import clsx from 'clsx'
import { Bike, Inbox, MapPin, MessageCircle, Phone, StickyNote, Store } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, usePedidos } from '../../services/db'
import type { Pedido, StatusPedido } from '../../types'
import { formatarHora, formatarPreco, tempoDecorrido } from '../../utils/formatar'
import { corStatus, rotuloStatus } from '../status'
import { Confirmar, TituloPagina } from '../ui'

const proximo: Partial<Record<StatusPedido, StatusPedido>> = {
  novo: 'preparo',
  preparo: 'saiu',
  saiu: 'concluido',
}

function textoAcao(pedido: Pedido) {
  switch (pedido.status) {
    case 'novo':
      return 'Aceitar e preparar'
    case 'preparo':
      return pedido.tipo === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada'
    case 'saiu':
      return pedido.tipo === 'entrega' ? 'Marcar como entregue' : 'Marcar como retirado'
    default:
      return ''
  }
}

const colunas: { status: StatusPedido; titulo: string; cor: string }[] = [
  { status: 'novo', titulo: 'Novos', cor: 'bg-orange-500' },
  { status: 'preparo', titulo: 'Em preparo', cor: 'bg-amber-500' },
  { status: 'saiu', titulo: 'A caminho / prontos', cor: 'bg-sky-500' },
]

const nomesPagamento = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' }

export default function Pedidos() {
  const pedidos = usePedidos()
  const [aba, setAba] = useState<'andamento' | 'historico'>('andamento')
  const [cancelando, setCancelando] = useState<Pedido | null>(null)
  const [, forcarAtualizacao] = useState(0)

  // Atualiza o "há X min" dos cartões
  useEffect(() => {
    const intervalo = setInterval(() => forcarAtualizacao((n) => n + 1), 30_000)
    return () => clearInterval(intervalo)
  }, [])

  const historico = pedidos.filter((p) => p.status === 'concluido' || p.status === 'cancelado')
  const emAndamento = pedidos.length - historico.length

  async function avancar(pedido: Pedido) {
    const status = proximo[pedido.status]
    if (!status) return
    await api.alterarStatusPedido(pedido.id, status)
    toast.success(`Pedido #${pedido.numero}: ${rotuloStatus(status, pedido.tipo).toLowerCase()}`)
  }

  return (
    <div>
      <TituloPagina titulo="Pedidos" descricao="Acompanhe e avance cada pedido até a entrega." />

      <div className="mb-6 inline-grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-stone-900/5">
        {(
          [
            ['andamento', `Em andamento (${emAndamento})`],
            ['historico', `Histórico (${historico.length})`],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={clsx(
              'relative h-10 rounded-xl px-4 text-sm font-semibold transition-colors',
              aba === valor ? 'text-white' : 'text-stone-500 hover:text-stone-900',
            )}
          >
            {aba === valor && <motion.span layoutId="aba-pedidos" className="absolute inset-0 rounded-xl bg-stone-900" />}
            <span className="relative">{rotulo}</span>
          </button>
        ))}
      </div>

      {aba === 'andamento' ? (
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-4">
          {colunas.map((coluna) => {
            const lista = pedidos.filter((p) => p.status === coluna.status)
            return (
              <section key={coluna.status}>
                <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-stone-700">
                  <span className={clsx('size-2 rounded-full', coluna.cor)} />
                  {coluna.titulo}
                  <span className="text-stone-400">{lista.length}</span>
                </h2>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {lista.map((pedido) => (
                      <CartaoPedido
                        key={pedido.id}
                        pedido={pedido}
                        onAvancar={() => avancar(pedido)}
                        onCancelar={() => setCancelando(pedido)}
                      />
                    ))}
                  </AnimatePresence>
                  {lista.length === 0 && (
                    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-stone-200 py-10 text-center text-sm text-stone-400">
                      <Inbox className="mb-2 size-6" />
                      Nenhum pedido
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      ) : historico.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-sm text-stone-500 shadow-sm ring-1 ring-stone-900/5">
          Pedidos concluídos e cancelados aparecem aqui.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-900/5">
          <ul className="divide-y divide-stone-100">
            {historico.map((pedido) => (
              <li key={pedido.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                <span className="w-14 text-sm font-bold text-stone-900">#{pedido.numero}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{pedido.cliente.nome}</p>
                  <p className="truncate text-xs text-stone-500">
                    {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')} às {formatarHora(pedido.criadoEm)} ·{' '}
                    {pedido.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}
                  </p>
                </div>
                <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', corStatus[pedido.status])}>
                  {rotuloStatus(pedido.status, pedido.tipo)}
                </span>
                <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatarPreco(pedido.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Confirmar
        aberto={cancelando !== null}
        onAbertoChange={(aberto) => !aberto && setCancelando(null)}
        titulo={`Cancelar pedido #${cancelando?.numero}?`}
        mensagem="O cliente verá o pedido como cancelado. Essa ação não pode ser desfeita."
        textoConfirmar="Cancelar pedido"
        perigo
        onConfirmar={async () => {
          if (!cancelando) return
          await api.alterarStatusPedido(cancelando.id, 'cancelado')
          toast(`Pedido #${cancelando.numero} cancelado`)
        }}
      />
    </div>
  )
}

function CartaoPedido({
  pedido,
  onAvancar,
  onCancelar,
}: {
  pedido: Pedido
  onAvancar: () => void
  onCancelar: () => void
}) {
  const telefone = pedido.cliente.telefone.replace(/\D/g, '')
  const novo = pedido.status === 'novo'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={clsx(
        'rounded-3xl bg-white p-4 shadow-sm ring-1',
        novo ? 'ring-2 ring-orange-400' : 'ring-stone-900/5',
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 font-bold text-stone-900">
            #{pedido.numero}
            <span
              className={clsx(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                pedido.tipo === 'entrega' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700',
              )}
            >
              {pedido.tipo === 'entrega' ? <Bike className="size-3" /> : <Store className="size-3" />}
              {pedido.tipo === 'entrega' ? 'Entrega' : 'Retirada'}
            </span>
          </p>
          <p className="text-xs text-stone-500">
            {formatarHora(pedido.criadoEm)} · {tempoDecorrido(pedido.criadoEm)}
          </p>
        </div>
        <p className="font-display text-lg font-semibold tabular-nums">{formatarPreco(pedido.total)}</p>
      </header>

      <ul className="mt-3 space-y-1.5 rounded-2xl bg-stone-50 p-3 text-sm">
        {pedido.itens.map((item) => (
          <li key={item.chave}>
            <span className="font-semibold">{item.quantidade}×</span> {item.nome}{' '}
            <span className="text-stone-500">
              ({[item.tamanho.nome, ...item.adicionais.map((a) => `+ ${a.nome}`)].join(', ')})
            </span>
          </li>
        ))}
      </ul>

      {pedido.observacao && (
        <p className="mt-2 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <StickyNote className="mt-0.5 size-4 shrink-0" />
          {pedido.observacao}
        </p>
      )}

      <div className="mt-3 space-y-1 text-sm text-stone-600">
        <p className="font-semibold text-stone-900">{pedido.cliente.nome}</p>
        {pedido.endereco && (
          <p className="flex gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-stone-400" />
            {pedido.endereco}
          </p>
        )}
        <p className="text-xs">
          {nomesPagamento[pedido.pagamento]}
          {pedido.trocoPara && ` · troco para ${formatarPreco(pedido.trocoPara)}`}
          {pedido.taxaEntrega > 0 && ` · entrega ${formatarPreco(pedido.taxaEntrega)}`}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onAvancar}
          className={clsx(
            'h-10 flex-1 rounded-xl text-sm font-semibold text-white transition',
            novo ? 'bg-orange-600 hover:bg-orange-700' : 'bg-stone-900 hover:bg-stone-800',
          )}
        >
          {textoAcao(pedido)}
        </button>
        {telefone && (
          <>
            <a
              href={`https://wa.me/55${telefone}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp do cliente"
              className="grid size-10 place-items-center rounded-xl text-emerald-600 ring-1 ring-stone-900/10 transition hover:bg-emerald-50"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href={`tel:${telefone}`}
              aria-label="Ligar para o cliente"
              className="grid size-10 place-items-center rounded-xl text-stone-600 ring-1 ring-stone-900/10 transition hover:bg-stone-50"
            >
              <Phone className="size-4" />
            </a>
          </>
        )}
      </div>
      <button
        onClick={onCancelar}
        className="mt-2 w-full text-center text-xs font-medium text-stone-400 transition hover:text-red-600"
      >
        Cancelar pedido
      </button>
    </motion.article>
  )
}
