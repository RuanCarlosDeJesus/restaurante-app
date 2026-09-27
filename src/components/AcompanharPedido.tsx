import clsx from 'clsx'
import { Bike, Check, ChefHat, CircleX, MessageCircle, PackageCheck, ReceiptText, Store } from 'lucide-react'
import { motion } from 'motion/react'
import { useConfig } from '../services/db'
import type { Pedido, StatusPedido } from '../types'
import { formatarHora, formatarPreco } from '../utils/formatar'
import { Modal } from './ui/Modal'

interface AcompanharPedidoProps {
  pedido: Pedido | null
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
}

const ordem: StatusPedido[] = ['novo', 'preparo', 'saiu', 'concluido']

function etapas(pedido: Pedido) {
  const entrega = pedido.tipo === 'entrega'
  return [
    { status: 'novo', titulo: 'Pedido recebido', icone: ReceiptText },
    { status: 'preparo', titulo: 'Em preparo', icone: ChefHat },
    { status: 'saiu', titulo: entrega ? 'Saiu para entrega' : 'Pronto para retirada', icone: entrega ? Bike : Store },
    { status: 'concluido', titulo: entrega ? 'Entregue' : 'Retirado', icone: PackageCheck },
  ] as const
}

function mensagemWhatsApp(pedido: Pedido) {
  const linhas = [
    `*Pedido #${pedido.numero}*`,
    ...pedido.itens.map(
      (i) =>
        `${i.quantidade}x ${i.nome} (${[i.tamanho.nome, ...i.adicionais.map((a) => `+${a.nome}`)].join(', ')})`,
    ),
    '',
    `Total: ${formatarPreco(pedido.total)}`,
    `${pedido.tipo === 'entrega' ? `Entrega: ${pedido.endereco}` : 'Retirada no local'}`,
    `Nome: ${pedido.cliente.nome}`,
  ]
  return encodeURIComponent(linhas.join('\n'))
}

export function AcompanharPedido({ pedido, aberto, onAbertoChange }: AcompanharPedidoProps) {
  const config = useConfig()
  if (!pedido) return null

  const cancelado = pedido.status === 'cancelado'
  const atual = ordem.indexOf(pedido.status)
  const quantidadeItens = pedido.itens.reduce((s, i) => s + i.quantidade, 0)
  const whatsapp = config.whatsapp.replace(/\D/g, '')

  return (
    <Modal aberto={aberto} onAbertoChange={onAbertoChange} titulo={`Pedido #${pedido.numero}`}>
      <div className="px-6 pb-8 pt-10 sm:px-8">
        <div className="flex items-center gap-4">
          <motion.span
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
            className={clsx(
              'grid size-14 shrink-0 place-items-center rounded-full text-white shadow-lg',
              cancelado ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30',
            )}
          >
            {cancelado ? <CircleX className="size-7" /> : <Check className="size-7" strokeWidth={3} />}
          </motion.span>
          <div>
            <p className="text-sm text-stone-500">
              Pedido #{pedido.numero} · {formatarHora(pedido.criadoEm)}
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {cancelado ? 'Pedido cancelado' : 'Pedido enviado!'}
            </h2>
          </div>
        </div>

        {cancelado ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            O restaurante cancelou este pedido. Entre em contato para mais informações.
          </p>
        ) : (
          <ol className="mt-8 space-y-0">
            {etapas(pedido).map((etapa, indice, lista) => {
              const feito = indice <= atual
              const agora = indice === atual
              const Icone = etapa.icone
              return (
                <li key={etapa.status} className="relative flex gap-4 pb-6 last:pb-0">
                  {indice < lista.length - 1 && (
                    <span className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 bg-stone-200">
                      <motion.span
                        className="block w-full bg-emerald-500"
                        initial={false}
                        animate={{ height: indice < atual ? '100%' : '0%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </span>
                  )}
                  <span
                    className={clsx(
                      'relative grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500',
                      feito ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400',
                      agora && 'ring-4 ring-emerald-100',
                    )}
                  >
                    <Icone className="size-5" />
                  </span>
                  <div className="pt-2">
                    <p className={clsx('text-sm font-semibold', feito ? 'text-stone-900' : 'text-stone-400')}>
                      {etapa.titulo}
                    </p>
                    {agora && pedido.status !== 'concluido' && (
                      <p className="mt-0.5 text-xs text-emerald-600">Agora</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        <div className="mt-8 flex items-center justify-between rounded-2xl bg-orange-50 p-4">
          <span className="text-sm text-stone-600">
            {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'} · pagamento na{' '}
            {pedido.tipo === 'entrega' ? 'entrega' : 'retirada'}
          </span>
          <span className="font-display text-xl font-semibold text-orange-600">{formatarPreco(pedido.total)}</span>
        </div>

        {whatsapp && (
          <a
            href={`https://wa.me/55${whatsapp}?text=${mensagemWhatsApp(pedido)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <MessageCircle className="size-4" />
            Falar com o restaurante
          </a>
        )}

        <button
          onClick={() => onAbertoChange(false)}
          className="mt-3 h-12 w-full rounded-full bg-stone-900 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Voltar ao cardápio
        </button>
      </div>
    </Modal>
  )
}
