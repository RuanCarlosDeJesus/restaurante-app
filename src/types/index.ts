export type Categoria = 'batatas' | 'porcoes' | 'frangos' | 'almoco' | 'bebidas'

export interface Opcao {
  id: string
  nome: string
  preco: number
}

export interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: Categoria
  /** URL externa ou imagem enviada pelo admin (data URL por enquanto) */
  imagem: string | null
  /** Pelo menos um tamanho. Com um só, o cliente não precisa escolher. */
  tamanhos: Opcao[]
  adicionais: Opcao[]
  selos: string[]
  /** false = esgotado (aparece, mas não dá para pedir) */
  disponivel: boolean
  /** false = escondido do cardápio */
  visivel: boolean
  criadoEm: string
}

export interface ItemCarrinho {
  chave: string
  produtoId: string
  nome: string
  imagem: string | null
  categoria: Categoria
  tamanho: Opcao
  adicionais: Opcao[]
  precoUnitario: number
  quantidade: number
}

export interface HorarioDia {
  aberto: boolean
  abre: string
  fecha: string
}

export type ModoLoja = 'automatico' | 'aberto' | 'fechado'

export interface ConfigLoja {
  nome: string
  whatsapp: string
  endereco: string
  modo: ModoLoja
  /** Índice 0 = domingo ... 6 = sábado */
  horarios: HorarioDia[]
  taxaEntrega: number
  freteGratisAcima: number | null
  pedidoMinimo: number
  tempoEntrega: string
  aceitaRetirada: boolean
  aceitaEntrega: boolean
}

export type StatusPedido = 'novo' | 'preparo' | 'saiu' | 'concluido' | 'cancelado'
export type TipoPedido = 'entrega' | 'retirada'
export type Pagamento = 'pix' | 'cartao' | 'dinheiro'

export interface Pedido {
  id: string
  numero: number
  criadoEm: string
  atualizadoEm: string
  status: StatusPedido
  tipo: TipoPedido
  cliente: { nome: string; telefone: string }
  endereco: string | null
  pagamento: Pagamento
  trocoPara: number | null
  observacao: string
  itens: ItemCarrinho[]
  subtotal: number
  taxaEntrega: number
  total: number
}

export type NovoPedido = Omit<Pedido, 'id' | 'numero' | 'criadoEm' | 'atualizadoEm' | 'status'>
