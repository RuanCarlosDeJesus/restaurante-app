import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Modal } from '../components/ui/Modal'
import { api, useConfig } from '../services/db'
import { calcularStatus, useStatusLoja } from '../utils/horario'

export function Switch({
  ligado,
  onChange,
  rotulo,
  tamanho = 'md',
}: {
  ligado: boolean
  onChange: (ligado: boolean) => void
  rotulo: string
  tamanho?: 'sm' | 'md'
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => onChange(!ligado)}
      className={clsx(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors',
        tamanho === 'md' ? 'h-7 w-12' : 'h-6 w-10',
        ligado ? 'bg-emerald-500' : 'bg-stone-300',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 35 }}
        className={clsx(
          'rounded-full bg-white shadow',
          tamanho === 'md' ? 'size-6' : 'size-5',
          ligado && 'ml-auto',
        )}
      />
    </button>
  )
}

export function Cartao({
  titulo,
  descricao,
  acao,
  children,
  className,
}: {
  titulo?: string
  descricao?: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={clsx('rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-900/5 sm:p-6', className)}>
      {(titulo || acao) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {titulo && <h2 className="font-semibold text-stone-900">{titulo}</h2>}
            {descricao && <p className="mt-0.5 text-sm text-stone-500">{descricao}</p>}
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  )
}

export function TituloPagina({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-stone-500">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}

export const classeCampo =
  'h-11 w-full rounded-xl border-0 bg-stone-50 px-3.5 text-sm ring-1 ring-stone-900/10 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500'

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-stone-400">{dica}</span>}
    </label>
  )
}

export function Confirmar({
  aberto,
  onAbertoChange,
  titulo,
  mensagem,
  textoConfirmar,
  perigo,
  onConfirmar,
}: {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  titulo: string
  mensagem: ReactNode
  textoConfirmar: string
  perigo?: boolean
  onConfirmar: () => Promise<void> | void
}) {
  const [carregando, setCarregando] = useState(false)

  async function confirmar() {
    setCarregando(true)
    try {
      await onConfirmar()
      onAbertoChange(false)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Modal aberto={aberto} onAbertoChange={onAbertoChange} titulo={titulo} largura="max-w-sm">
      <div className="px-6 pb-6 pt-10">
        <h2 className="text-lg font-semibold text-stone-900">{titulo}</h2>
        <div className="mt-2 text-sm text-stone-500">{mensagem}</div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAbertoChange(false)}
            className="h-11 rounded-xl text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 transition hover:bg-stone-50"
          >
            Voltar
          </button>
          <button
            onClick={confirmar}
            disabled={carregando}
            className={clsx(
              'flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-70',
              perigo ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-900 hover:bg-stone-800',
            )}
          >
            {carregando && <Loader2 className="size-4 animate-spin" />}
            {textoConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/** Liga/desliga o recebimento de pedidos. Usado no topo do painel e no dashboard. */
export function InterruptorLoja({ compacto }: { compacto?: boolean }) {
  const config = useConfig()
  const status = useStatusLoja()
  const pelosHorarios = calcularStatus({ ...config, modo: 'automatico' })

  async function alternar(abrir: boolean) {
    // Ao abrir: se o horário já diz "aberto", volta ao automático; senão força aberto
    const modo = abrir ? (pelosHorarios.aberta ? 'automatico' : 'aberto') : 'fechado'
    await api.alterarModoLoja(modo)
    toast.success(abrir ? 'Loja aberta — recebendo pedidos' : 'Loja fechada — pedidos pausados')
  }

  const explicacao =
    config.modo === 'automatico'
      ? 'Automático pelos horários'
      : config.modo === 'aberto'
        ? 'Aberta manualmente'
        : 'Fechada manualmente'

  if (compacto) {
    return (
      <div className="flex items-center gap-2.5">
        <Switch ligado={status.aberta} onChange={alternar} rotulo="Loja aberta" tamanho="sm" />
        <span className={clsx('text-sm font-semibold', status.aberta ? 'text-emerald-700' : 'text-red-600')}>
          {status.aberta ? 'Aberta' : 'Fechada'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="relative flex size-3">
          {status.aberta && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={clsx('relative inline-flex size-3 rounded-full', status.aberta ? 'bg-emerald-500' : 'bg-red-500')} />
        </span>
        <div>
          <p className="font-semibold text-stone-900">
            {status.aberta ? 'Loja aberta' : 'Loja fechada'}{' '}
            <span className="font-normal text-stone-500">· {status.detalhe}</span>
          </p>
          <p className="text-xs text-stone-500">
            {explicacao}
            {config.modo !== 'automatico' && (
              <>
                {' · '}
                <button
                  onClick={() => api.alterarModoLoja('automatico')}
                  className="font-semibold text-orange-600 hover:underline"
                >
                  voltar ao automático
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      <Switch ligado={status.aberta} onChange={alternar} rotulo="Loja aberta" />
    </div>
  )
}
