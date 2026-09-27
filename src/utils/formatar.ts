import type { ConfigLoja, Produto, TipoPedido } from '../types'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarPreco(valor: number) {
  return moeda.format(valor)
}

export function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

export function formatarTelefone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function tempoDecorrido(iso: string, agora = Date.now()) {
  const min = Math.floor((agora - new Date(iso).getTime()) / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function precoMinimo(produto: Produto) {
  return Math.min(...produto.tamanhos.map((t) => t.preco))
}

export function calcularEntrega(config: ConfigLoja, subtotal: number, tipo: TipoPedido) {
  if (tipo === 'retirada' || subtotal === 0) return 0
  if (config.freteGratisAcima !== null && subtotal >= config.freteGratisAcima) return 0
  return config.taxaEntrega
}

/** Produto sem escolhas (1 tamanho, sem adicionais) vai direto pro carrinho pelo botão "+". */
export function produtoSimples(produto: Produto) {
  return produto.tamanhos.length === 1 && produto.adicionais.length === 0
}
