import { useSyncExternalStore } from 'react'
import { configInicial, produtosIniciais } from '../data/seed'
import type { ConfigLoja, NovoPedido, Pedido, Produto, StatusPedido } from '../types'

/**
 * "Backend" provisório: guarda tudo no localStorage do navegador.
 *
 * O resto do app só conversa com `api` e com os hooks `use*` deste arquivo.
 * Quando existir um backend de verdade (ex.: Supabase), basta reescrever
 * este arquivo mantendo as mesmas funções — telas e componentes não mudam.
 *
 * Abas diferentes do mesmo navegador ficam sincronizadas (evento `storage`),
 * então dá para testar a loja numa aba e o painel admin em outra.
 */

interface Tabelas {
  produtos: Produto[]
  config: ConfigLoja
  pedidos: Pedido[]
}

const CHAVES: Record<keyof Tabelas, string> = {
  produtos: 'saborecia:produtos',
  config: 'saborecia:config',
  pedidos: 'saborecia:pedidos',
}

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

function carregar(): Tabelas {
  return {
    produtos: ler(CHAVES.produtos, produtosIniciais),
    config: { ...configInicial, ...ler<Partial<ConfigLoja>>(CHAVES.config, {}) },
    pedidos: ler(CHAVES.pedidos, []),
  }
}

let dados = carregar()
const ouvintes = new Set<() => void>()

function notificar() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

function gravar<K extends keyof Tabelas>(tabela: K, valor: Tabelas[K]) {
  try {
    localStorage.setItem(CHAVES[tabela], JSON.stringify(valor))
  } catch {
    throw new Error('Sem espaço para salvar. Use imagens menores ou remova algumas fotos.')
  }
  dados = { ...dados, [tabela]: valor }
  notificar()
}

window.addEventListener('storage', (evento) => {
  if (evento.key && Object.values(CHAVES).includes(evento.key)) {
    dados = carregar()
    notificar()
  }
})

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export const useProdutos = () => useSyncExternalStore(assinar, () => dados.produtos)
export const useConfig = () => useSyncExternalStore(assinar, () => dados.config)
export const usePedidos = () => useSyncExternalStore(assinar, () => dados.pedidos)

/** Simula a demora de uma requisição, para as telas já nascerem com estado de carregamento. */
const esperar = (ms = 350) => new Promise((resolver) => setTimeout(resolver, ms))

const gerarId = () => crypto.randomUUID()
const agora = () => new Date().toISOString()

export const api = {
  async salvarProduto(produto: Omit<Produto, 'id' | 'criadoEm'> & { id?: string }) {
    await esperar()
    const existente = produto.id && dados.produtos.find((p) => p.id === produto.id)
    if (existente) {
      const atualizado = { ...existente, ...produto } as Produto
      gravar('produtos', dados.produtos.map((p) => (p.id === atualizado.id ? atualizado : p)))
      return atualizado
    }
    const novo: Produto = { ...produto, id: gerarId(), criadoEm: agora() }
    gravar('produtos', [...dados.produtos, novo])
    return novo
  },

  async removerProduto(id: string) {
    await esperar()
    gravar('produtos', dados.produtos.filter((p) => p.id !== id))
  },

  async atualizarProduto(id: string, campos: Partial<Produto>) {
    gravar('produtos', dados.produtos.map((p) => (p.id === id ? { ...p, ...campos } : p)))
  },

  async salvarConfig(config: ConfigLoja) {
    await esperar()
    gravar('config', config)
  },

  async alterarModoLoja(modo: ConfigLoja['modo']) {
    gravar('config', { ...dados.config, modo })
  },

  async criarPedido(novo: NovoPedido) {
    await esperar(700)
    const ultimo = dados.pedidos.reduce((maior, p) => Math.max(maior, p.numero), 1000)
    const pedido: Pedido = {
      ...novo,
      id: gerarId(),
      numero: ultimo + 1,
      status: 'novo',
      criadoEm: agora(),
      atualizadoEm: agora(),
    }
    gravar('pedidos', [pedido, ...dados.pedidos])
    return pedido
  },

  async alterarStatusPedido(id: string, status: StatusPedido) {
    gravar(
      'pedidos',
      dados.pedidos.map((p) => (p.id === id ? { ...p, status, atualizadoEm: agora() } : p)),
    )
  },

  async restaurarPadrao() {
    await esperar()
    gravar('produtos', produtosIniciais)
    gravar('config', configInicial)
  },
}
