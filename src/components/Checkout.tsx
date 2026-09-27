import clsx from 'clsx'
import { AlertCircle, Banknote, Bike, CreditCard, Loader2, QrCode, Store, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useCarrinho } from '../context/CarrinhoContext'
import { api, useConfig, useProdutos } from '../services/db'
import type { Pagamento, Pedido, TipoPedido } from '../types'
import { calcularEntrega, formatarPreco, formatarTelefone } from '../utils/formatar'
import { useStatusLoja } from '../utils/horario'
import { Modal } from './ui/Modal'

interface CheckoutProps {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onPedidoCriado: (pedido: Pedido) => void
}

const CHAVE_CLIENTE = 'saborecia:cliente'

interface DadosCliente {
  nome: string
  telefone: string
  rua: string
  bairro: string
  complemento: string
}

function carregarCliente(): DadosCliente {
  try {
    return { nome: '', telefone: '', rua: '', bairro: '', complemento: '', ...JSON.parse(localStorage.getItem(CHAVE_CLIENTE) ?? '{}') }
  } catch {
    return { nome: '', telefone: '', rua: '', bairro: '', complemento: '' }
  }
}

const pagamentos: { valor: Pagamento; rotulo: string; icone: LucideIcon }[] = [
  { valor: 'pix', rotulo: 'Pix', icone: QrCode },
  { valor: 'cartao', rotulo: 'Cartão', icone: CreditCard },
  { valor: 'dinheiro', rotulo: 'Dinheiro', icone: Banknote },
]

export function Checkout({ aberto, onAbertoChange, onPedidoCriado }: CheckoutProps) {
  const config = useConfig()
  const produtos = useProdutos()
  const status = useStatusLoja()
  const { itens, subtotal, limpar } = useCarrinho()

  const [cliente, setCliente] = useState(carregarCliente)
  const [tipo, setTipo] = useState<TipoPedido>(config.aceitaEntrega ? 'entrega' : 'retirada')
  const [pagamento, setPagamento] = useState<Pagamento>('pix')
  const [trocoPara, setTrocoPara] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const taxaEntrega = calcularEntrega(config, subtotal, tipo)
  const total = subtotal + taxaEntrega

  function alterar(campo: keyof DadosCliente, valor: string) {
    setCliente((atual) => ({ ...atual, [campo]: campo === 'telefone' ? formatarTelefone(valor) : valor }))
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')

    if (!status.aberta) return setErro(`A loja fechou. ${status.detalhe}.`)
    if (cliente.nome.trim().length < 2) return setErro('Informe seu nome.')
    if (cliente.telefone.replace(/\D/g, '').length < 10) return setErro('Informe um telefone válido com DDD.')
    if (tipo === 'entrega' && (!cliente.rua.trim() || !cliente.bairro.trim())) {
      return setErro('Informe rua, número e bairro para a entrega.')
    }
    const troco = pagamento === 'dinheiro' && trocoPara ? Number(trocoPara.replace(',', '.')) : null
    if (troco !== null && (Number.isNaN(troco) || troco < total)) {
      return setErro(`O troco precisa ser para um valor maior que ${formatarPreco(total)}.`)
    }

    const indisponiveis = itens.filter((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId)
      return !produto || !produto.disponivel || !produto.visivel
    })
    if (indisponiveis.length > 0) {
      return setErro(`Esgotou: ${indisponiveis.map((i) => i.nome).join(', ')}. Remova do carrinho para continuar.`)
    }

    setEnviando(true)
    try {
      localStorage.setItem(CHAVE_CLIENTE, JSON.stringify(cliente))
      const pedido = await api.criarPedido({
        tipo,
        cliente: { nome: cliente.nome.trim(), telefone: cliente.telefone },
        endereco:
          tipo === 'entrega'
            ? [cliente.rua.trim(), cliente.bairro.trim(), cliente.complemento.trim()].filter(Boolean).join(' — ')
            : null,
        pagamento,
        trocoPara: troco,
        observacao: observacao.trim(),
        itens,
        subtotal,
        taxaEntrega,
        total,
      })
      limpar()
      onPedidoCriado(pedido)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar o pedido.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal aberto={aberto} onAbertoChange={onAbertoChange} titulo="Finalizar pedido" largura="max-w-lg">
      <form onSubmit={enviar} className="px-6 pb-6 pt-10 sm:px-8" noValidate>
        <h2 className="font-display text-3xl font-semibold tracking-tight">Finalizar pedido</h2>
        <p className="mt-1 text-sm text-stone-500">Pagamento na entrega ou na retirada.</p>

        {config.aceitaEntrega && config.aceitaRetirada && (
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1">
            {(['entrega', 'retirada'] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setTipo(opcao)}
                className={clsx(
                  'relative flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
                  tipo === opcao ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800',
                )}
              >
                {tipo === opcao && (
                  <motion.span layoutId="tipo-pedido" className="absolute inset-0 rounded-xl bg-white shadow-sm" />
                )}
                {opcao === 'entrega' ? <Bike className="relative size-4" /> : <Store className="relative size-4" />}
                <span className="relative">{opcao === 'entrega' ? 'Entrega' : 'Retirar no local'}</span>
              </button>
            ))}
          </div>
        )}

        <Secao titulo="Seus dados">
          <Entrada rotulo="Nome" value={cliente.nome} onChange={(v) => alterar('nome', v)} autoComplete="name" />
          <Entrada
            rotulo="Telefone / WhatsApp"
            value={cliente.telefone}
            onChange={(v) => alterar('telefone', v)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 91234-5678"
          />
        </Secao>

        {tipo === 'entrega' ? (
          <Secao titulo="Endereço de entrega">
            <Entrada rotulo="Rua e número" value={cliente.rua} onChange={(v) => alterar('rua', v)} autoComplete="street-address" />
            <div className="grid grid-cols-2 gap-3">
              <Entrada rotulo="Bairro" value={cliente.bairro} onChange={(v) => alterar('bairro', v)} />
              <Entrada
                rotulo="Complemento"
                value={cliente.complemento}
                onChange={(v) => alterar('complemento', v)}
                placeholder="Opcional"
              />
            </div>
          </Secao>
        ) : (
          config.endereco && (
            <p className="mt-6 flex items-start gap-2 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              <Store className="mt-0.5 size-4 shrink-0 text-orange-500" />
              <span>
                Retire em: <b className="text-stone-800">{config.endereco}</b>
              </span>
            </p>
          )
        )}

        <Secao titulo="Pagamento">
          <div className="grid grid-cols-3 gap-2">
            {pagamentos.map(({ valor, rotulo, icone: Icone }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setPagamento(valor)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 rounded-2xl py-3.5 text-sm font-semibold ring-1 transition',
                  pagamento === valor
                    ? 'bg-orange-50 text-orange-700 ring-2 ring-orange-500'
                    : 'text-stone-600 ring-stone-900/10 hover:bg-stone-50',
                )}
              >
                <Icone className="size-5" />
                {rotulo}
              </button>
            ))}
          </div>
          {pagamento === 'dinheiro' && (
            <Entrada
              rotulo="Troco para quanto?"
              value={trocoPara}
              onChange={setTrocoPara}
              inputMode="decimal"
              placeholder="Deixe vazio se não precisar"
            />
          )}
        </Secao>

        <Secao titulo="Observações">
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={2}
            placeholder="Ex.: sem cebola, tocar o interfone..."
            className="w-full resize-none rounded-2xl border-0 bg-stone-50 px-4 py-3 text-sm ring-1 ring-stone-900/10 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500"
          />
        </Secao>

        <dl className="mt-6 space-y-1.5 rounded-2xl bg-stone-50 p-4 text-sm">
          <div className="flex justify-between text-stone-500">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatarPreco(subtotal)}</dd>
          </div>
          {tipo === 'entrega' && (
            <div className="flex justify-between text-stone-500">
              <dt>Entrega</dt>
              <dd className={clsx('tabular-nums', taxaEntrega === 0 && 'font-semibold text-emerald-600')}>
                {taxaEntrega === 0 ? 'Grátis' : formatarPreco(taxaEntrega)}
              </dd>
            </div>
          )}
          <div className="flex justify-between pt-1 font-semibold text-stone-900">
            <dt>Total</dt>
            <dd className="font-display text-xl tabular-nums">{formatarPreco(total)}</dd>
          </div>
        </dl>

        {erro && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {erro}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={enviando || itens.length === 0}
          className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-orange-600 text-sm font-semibold text-white shadow-xl shadow-orange-600/30 transition-colors hover:bg-orange-700 disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enviando pedido...
            </>
          ) : (
            <>Enviar pedido · {formatarPreco(total)}</>
          )}
        </motion.button>
      </form>
    </Modal>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="mt-6 space-y-3">
      <legend className="mb-3 text-sm font-bold text-stone-900">{titulo}</legend>
      {children}
    </fieldset>
  )
}

interface EntradaProps {
  rotulo: string
  value: string
  onChange: (valor: string) => void
  placeholder?: string
  autoComplete?: string
  inputMode?: 'tel' | 'decimal' | 'text'
}

function Entrada({ rotulo, onChange, ...props }: EntradaProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-stone-600">{rotulo}</span>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border-0 bg-stone-50 px-4 text-sm ring-1 ring-stone-900/10 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500"
      />
    </label>
  )
}
