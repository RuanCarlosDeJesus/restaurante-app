import type { StatusPedido, TipoPedido } from '../types'

export function rotuloStatus(status: StatusPedido, tipo: TipoPedido) {
  switch (status) {
    case 'novo':
      return 'Novo'
    case 'preparo':
      return 'Em preparo'
    case 'saiu':
      return tipo === 'entrega' ? 'Saiu p/ entrega' : 'Pronto p/ retirada'
    case 'concluido':
      return tipo === 'entrega' ? 'Entregue' : 'Retirado'
    case 'cancelado':
      return 'Cancelado'
  }
}

export const corStatus: Record<StatusPedido, string> = {
  novo: 'bg-orange-100 text-orange-700',
  preparo: 'bg-amber-100 text-amber-700',
  saiu: 'bg-sky-100 text-sky-700',
  concluido: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-stone-100 text-stone-500',
}
