import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ItemCarrinho } from '../types'

type NovoItem = Omit<ItemCarrinho, 'chave' | 'quantidade'>

interface CarrinhoContextType {
  itens: ItemCarrinho[]
  adicionar: (item: NovoItem, quantidade?: number) => void
  remover: (chave: string) => void
  alterarQuantidade: (chave: string, quantidade: number) => void
  limpar: () => void
  subtotal: number
  quantidadeTotal: number
}

const CHAVE_STORAGE = 'saborecia:carrinho'

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined)

/** Mesmo produto com tamanho/adicionais diferentes vira outra linha do carrinho. */
function gerarChave(item: NovoItem) {
  const adicionais = item.adicionais
    .map((a) => a.id)
    .sort()
    .join(',')
  return `${item.produtoId}|${item.tamanho.id}|${adicionais}`
}

function carregar(): ItemCarrinho[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE) ?? '[]') as ItemCarrinho[]
  } catch {
    return []
  }
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens))
    } catch {
      // Sem espaço: o carrinho só não persiste entre visitas
    }
  }, [itens])

  function adicionar(item: NovoItem, quantidade = 1) {
    const chave = gerarChave(item)
    setItens((atual) => {
      if (atual.some((i) => i.chave === chave)) {
        return atual.map((i) => (i.chave === chave ? { ...i, quantidade: i.quantidade + quantidade } : i))
      }
      return [...atual, { ...item, chave, quantidade }]
    })
  }

  function remover(chave: string) {
    setItens((atual) => atual.filter((item) => item.chave !== chave))
  }

  function alterarQuantidade(chave: string, quantidade: number) {
    if (quantidade <= 0) {
      remover(chave)
      return
    }
    setItens((atual) => atual.map((item) => (item.chave === chave ? { ...item, quantidade } : item)))
  }

  function limpar() {
    setItens([])
  }

  const subtotal = useMemo(
    () => itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0),
    [itens],
  )

  const quantidadeTotal = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens],
  )

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, remover, alterarQuantidade, limpar, subtotal, quantidadeTotal }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext)
  if (!contexto) {
    throw new Error('useCarrinho precisa ser usado dentro de um CarrinhoProvider')
  }
  return contexto
}
