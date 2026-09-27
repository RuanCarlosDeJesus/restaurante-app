import confetti from 'canvas-confetti'
import { ChefHat, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { AcompanharPedido } from '../components/AcompanharPedido'
import { Cardapio } from '../components/Cardapio'
import { Carrinho } from '../components/Carrinho'
import { Checkout } from '../components/Checkout'
import { DetalhePrato } from '../components/DetalhePrato'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { CarrinhoProvider, useCarrinho } from '../context/CarrinhoContext'
import { useDesktop } from '../hooks/useMediaQuery'
import { useConfig, usePedidos } from '../services/db'
import type { Opcao, Pedido, Produto } from '../types'
import { formatarPreco } from '../utils/formatar'

// Tempo para um modal terminar de fechar antes de abrir o próximo
const TROCA_DE_MODAL_MS = 250
const CHAVE_MEU_PEDIDO = 'saborecia:meu-pedido'

export function Loja() {
  return (
    <CarrinhoProvider>
      <Restaurante />
    </CarrinhoProvider>
  )
}

function Restaurante() {
  const desktop = useDesktop()
  const config = useConfig()
  const pedidos = usePedidos()
  const { adicionar, subtotal, quantidadeTotal } = useCarrinho()

  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [checkoutAberto, setCheckoutAberto] = useState(false)
  const [aberturasCheckout, setAberturasCheckout] = useState(0)

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [detalheAberto, setDetalheAberto] = useState(false)
  const [aberturasDetalhe, setAberturasDetalhe] = useState(0)

  const [meuPedidoId, setMeuPedidoId] = useState(() => localStorage.getItem(CHAVE_MEU_PEDIDO))
  const [pedidoAberto, setPedidoAberto] = useState(false)

  const meuPedido = pedidos.find((p) => p.id === meuPedidoId) ?? null
  const pedidoAtivo =
    meuPedido && meuPedido.status !== 'concluido' && meuPedido.status !== 'cancelado' ? meuPedido : null

  function abrirProduto(produto: Produto) {
    setProdutoSelecionado(produto)
    setAberturasDetalhe((n) => n + 1)
    setDetalheAberto(true)
  }

  function adicionarAoCarrinho(produto: Produto, tamanho: Opcao, adicionais: Opcao[], quantidade: number) {
    adicionar(
      {
        produtoId: produto.id,
        nome: produto.nome,
        imagem: produto.imagem,
        categoria: produto.categoria,
        tamanho,
        adicionais,
        precoUnitario: tamanho.preco + adicionais.reduce((soma, a) => soma + a.preco, 0),
      },
      quantidade,
    )
    toast.success(quantidade > 1 ? `${quantidade}× ${produto.nome}` : produto.nome, {
      description: 'Adicionado ao carrinho',
      action: { label: 'Ver carrinho', onClick: () => setCarrinhoAberto(true) },
    })
  }

  function continuarParaCheckout() {
    setCarrinhoAberto(false)
    setAberturasCheckout((n) => n + 1)
    setTimeout(() => setCheckoutAberto(true), TROCA_DE_MODAL_MS)
  }

  function pedidoCriado(pedido: Pedido) {
    localStorage.setItem(CHAVE_MEU_PEDIDO, pedido.id)
    setMeuPedidoId(pedido.id)
    setCheckoutAberto(false)
    setTimeout(() => {
      setPedidoAberto(true)
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, zIndex: 9999 })
    }, TROCA_DE_MODAL_MS)
  }

  return (
    <div className="min-h-dvh">
      <Header
        pedidoAtivo={pedidoAtivo}
        onAbrirCarrinho={() => setCarrinhoAberto(true)}
        onAbrirPedido={() => setPedidoAberto(true)}
      />

      <main>
        <Hero />
        <Cardapio
          onSelecionarPrato={abrirProduto}
          onAdicionarRapido={(produto) => adicionarAoCarrinho(produto, produto.tamanhos[0], [], 1)}
        />
      </main>

      <footer className="border-t border-stone-900/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2 font-medium text-stone-700">
            <ChefHat className="size-4 text-orange-600" /> {config.nome}
            {config.endereco && <span className="font-normal text-stone-500">· {config.endereco}</span>}
          </span>
          <span className="flex items-center gap-4">
            © {new Date().getFullYear()}
            <Link to="/admin" className="text-stone-400 transition hover:text-stone-700">
              Área do restaurante
            </Link>
          </span>
        </div>
      </footer>

      {/* Barra flutuante do carrinho (só no celular) */}
      <AnimatePresence>
        {!desktop && quantidadeTotal > 0 && !carrinhoAberto && !checkoutAberto && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCarrinhoAberto(true)}
            className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-15 items-center justify-between rounded-full bg-stone-900 pl-2 pr-6 text-white shadow-2xl shadow-stone-900/40"
          >
            <span className="flex items-center gap-3">
              <span className="relative grid size-11 place-items-center rounded-full bg-orange-600">
                <ShoppingBag className="size-5" />
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-stone-900">
                  {quantidadeTotal}
                </span>
              </span>
              <span className="text-sm font-semibold">Ver carrinho</span>
            </span>
            <span className="font-display text-lg font-semibold tabular-nums">{formatarPreco(subtotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <DetalhePrato
        key={`detalhe-${aberturasDetalhe}`}
        produto={produtoSelecionado}
        aberto={detalheAberto}
        onAbertoChange={setDetalheAberto}
        onAdicionar={adicionarAoCarrinho}
      />
      <Carrinho aberto={carrinhoAberto} onAbertoChange={setCarrinhoAberto} onContinuar={continuarParaCheckout} />
      <Checkout
        key={`checkout-${aberturasCheckout}`}
        aberto={checkoutAberto}
        onAbertoChange={setCheckoutAberto}
        onPedidoCriado={pedidoCriado}
      />
      <AcompanharPedido pedido={meuPedido} aberto={pedidoAberto} onAbertoChange={setPedidoAberto} />
    </div>
  )
}
