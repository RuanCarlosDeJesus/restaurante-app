import clsx from 'clsx'
import { CalendarClock, Copy, Loader2, Power, PowerOff, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { configInicial } from '../../data/seed'
import { api, useConfig } from '../../services/db'
import type { ConfigLoja, ModoLoja } from '../../types'
import { NOMES_DIAS, useStatusLoja } from '../../utils/horario'
import { Campo, Cartao, classeCampo, Confirmar, Switch, TituloPagina } from '../ui'

type Formulario = Omit<ConfigLoja, 'modo' | 'taxaEntrega' | 'freteGratisAcima' | 'pedidoMinimo'> & {
  taxaEntrega: string
  freteGratisAcima: string
  pedidoMinimo: string
}

const paraTexto = (n: number | null) => (n === null ? '' : n.toFixed(2).replace('.', ','))
const paraNumero = (t: string) => Number(t.replace(',', '.')) || 0

function paraFormulario(config: ConfigLoja): Formulario {
  return {
    ...config,
    taxaEntrega: paraTexto(config.taxaEntrega),
    freteGratisAcima: paraTexto(config.freteGratisAcima),
    pedidoMinimo: paraTexto(config.pedidoMinimo),
  }
}

const modos: { valor: ModoLoja; titulo: string; descricao: string; icone: typeof Power }[] = [
  { valor: 'automatico', titulo: 'Automático', descricao: 'Abre e fecha pelos horários abaixo', icone: CalendarClock },
  { valor: 'aberto', titulo: 'Forçar aberto', descricao: 'Recebe pedidos fora do horário', icone: Power },
  { valor: 'fechado', titulo: 'Forçar fechado', descricao: 'Pausa os pedidos (feriado, imprevisto)', icone: PowerOff },
]

export default function ConfiguracoesLoja() {
  const config = useConfig()
  const status = useStatusLoja()
  const [form, setForm] = useState(() => paraFormulario(config))
  const [salvando, setSalvando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)

  const alterado = JSON.stringify(form) !== JSON.stringify(paraFormulario(config))

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function alterarDia(indice: number, campos: Partial<Formulario['horarios'][number]>) {
    alterar(
      'horarios',
      form.horarios.map((h, i) => (i === indice ? { ...h, ...campos } : h)),
    )
  }

  async function salvar() {
    if (!form.aceitaEntrega && !form.aceitaRetirada) {
      toast.error('Ative pelo menos entrega ou retirada.')
      return
    }
    setSalvando(true)
    try {
      await api.salvarConfig({
        ...form,
        nome: form.nome.trim() || 'Meu restaurante',
        modo: config.modo,
        taxaEntrega: paraNumero(form.taxaEntrega),
        freteGratisAcima: form.freteGratisAcima.trim() ? paraNumero(form.freteGratisAcima) : null,
        pedidoMinimo: paraNumero(form.pedidoMinimo),
      })
      toast.success('Configurações salvas')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  const soNumero = (valor: string) => valor.replace(/[^\d,]/g, '')

  return (
    <div className="pb-16">
      <TituloPagina titulo="Loja e horários" descricao="Controle quando a loja recebe pedidos e como entrega." />

      <div className="space-y-6">
        <Cartao
          titulo="Status agora"
          descricao={`${status.aberta ? 'Aberta' : 'Fechada'} · ${status.detalhe}`}
          acao={
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-bold',
                status.aberta ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
              )}
            >
              {status.aberta ? 'ABERTA' : 'FECHADA'}
            </span>
          }
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {modos.map(({ valor, titulo, descricao, icone: Icone }) => (
              <button
                key={valor}
                onClick={async () => {
                  await api.alterarModoLoja(valor)
                  toast.success(`Modo: ${titulo}`)
                }}
                className={clsx(
                  'flex items-start gap-3 rounded-2xl p-4 text-left transition',
                  config.modo === valor ? 'bg-orange-50 ring-2 ring-orange-500' : 'ring-1 ring-stone-900/10 hover:bg-stone-50',
                )}
              >
                <Icone className={clsx('mt-0.5 size-5 shrink-0', config.modo === valor ? 'text-orange-600' : 'text-stone-400')} />
                <span>
                  <span className="block text-sm font-semibold">{titulo}</span>
                  <span className="block text-xs text-stone-500">{descricao}</span>
                </span>
              </button>
            ))}
          </div>
        </Cartao>

        <Cartao
          titulo="Horário de funcionamento"
          descricao="Se fechar depois da meia-noite, é só colocar o horário normal (ex.: 18:00 às 02:00)."
        >
          <ul className="divide-y divide-stone-100">
            {form.horarios.map((horario, i) => (
              <li key={NOMES_DIAS[i]} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-24 text-sm font-medium">{NOMES_DIAS[i]}</span>
                <Switch ligado={horario.aberto} onChange={(v) => alterarDia(i, { aberto: v })} rotulo={`Abre ${NOMES_DIAS[i]}`} tamanho="sm" />
                {horario.aberto ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={horario.abre}
                      onChange={(e) => alterarDia(i, { abre: e.target.value })}
                      className={clsx(classeCampo, 'h-10 w-28')}
                    />
                    <span className="text-sm text-stone-400">às</span>
                    <input
                      type="time"
                      value={horario.fecha}
                      onChange={(e) => alterarDia(i, { fecha: e.target.value })}
                      className={clsx(classeCampo, 'h-10 w-28')}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-stone-400">Fechado</span>
                )}
                {horario.aberto && (
                  <button
                    type="button"
                    onClick={() => {
                      alterar('horarios', form.horarios.map((h) => (h.aberto ? { ...h, abre: horario.abre, fecha: horario.fecha } : h)))
                      toast(`Horário de ${NOMES_DIAS[i].toLowerCase()} copiado para os dias abertos`)
                    }}
                    title="Copiar para os outros dias abertos"
                    className="ml-auto flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                  >
                    <Copy className="size-3.5" /> <span className="hidden sm:inline">Copiar p/ todos</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao titulo="Entrega e retirada">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Fazemos entrega</span>
              <Switch ligado={form.aceitaEntrega} onChange={(v) => alterar('aceitaEntrega', v)} rotulo="Entrega" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Cliente pode retirar no local</span>
              <Switch ligado={form.aceitaRetirada} onChange={(v) => alterar('aceitaRetirada', v)} rotulo="Retirada" />
            </div>

            <div className="grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2">
              <Campo rotulo="Taxa de entrega (R$)">
                <input
                  value={form.taxaEntrega}
                  onChange={(e) => alterar('taxaEntrega', soNumero(e.target.value))}
                  inputMode="decimal"
                  placeholder="0,00"
                  disabled={!form.aceitaEntrega}
                  className={clsx(classeCampo, 'disabled:opacity-50')}
                />
              </Campo>
              <Campo rotulo="Frete grátis acima de (R$)" dica="Deixe vazio para nunca dar frete grátis">
                <input
                  value={form.freteGratisAcima}
                  onChange={(e) => alterar('freteGratisAcima', soNumero(e.target.value))}
                  inputMode="decimal"
                  placeholder="Sem frete grátis"
                  disabled={!form.aceitaEntrega}
                  className={clsx(classeCampo, 'disabled:opacity-50')}
                />
              </Campo>
              <Campo rotulo="Pedido mínimo (R$)">
                <input
                  value={form.pedidoMinimo}
                  onChange={(e) => alterar('pedidoMinimo', soNumero(e.target.value))}
                  inputMode="decimal"
                  placeholder="0,00"
                  className={classeCampo}
                />
              </Campo>
              <Campo rotulo="Tempo de entrega">
                <input
                  value={form.tempoEntrega}
                  onChange={(e) => alterar('tempoEntrega', e.target.value)}
                  placeholder="Ex.: 40–60 min"
                  className={classeCampo}
                />
              </Campo>
            </div>
          </div>
        </Cartao>

        <Cartao titulo="Informações do restaurante">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome">
              <input value={form.nome} onChange={(e) => alterar('nome', e.target.value)} className={classeCampo} />
            </Campo>
            <Campo rotulo="WhatsApp" dica="Com DDD. Aparece para o cliente depois do pedido.">
              <input
                value={form.whatsapp}
                onChange={(e) => alterar('whatsapp', e.target.value)}
                inputMode="tel"
                placeholder="(11) 91234-5678"
                className={classeCampo}
              />
            </Campo>
            <Campo rotulo="Endereço" dica="Usado para retirada e no rodapé da loja.">
              <input
                value={form.endereco}
                onChange={(e) => alterar('endereco', e.target.value)}
                placeholder="Rua, número — bairro"
                className={classeCampo}
              />
            </Campo>
          </div>
        </Cartao>

        <Cartao titulo="Dados de exemplo" descricao="Volta o cardápio e as configurações para o padrão. Pedidos não são apagados.">
          <button
            onClick={() => setRestaurando(true)}
            className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
          >
            <RotateCcw className="size-4" /> Restaurar padrão
          </button>
        </Cartao>
      </div>

      {alterado && (
        <div className="fixed inset-x-4 bottom-20 z-20 lg:bottom-6 lg:left-[calc(16rem+2.5rem)] lg:right-10">
          <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl bg-stone-900 p-3 pl-5 text-white shadow-2xl">
            <p className="flex-1 text-sm">Você tem alterações não salvas</p>
            <button
              onClick={() => setForm(paraFormulario(config))}
              className="h-10 rounded-xl px-3 text-sm font-semibold text-stone-300 transition hover:bg-white/10"
            >
              Descartar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold transition hover:bg-orange-700 disabled:opacity-60"
            >
              {salvando && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </div>
      )}

      <Confirmar
        aberto={restaurando}
        onAbertoChange={setRestaurando}
        titulo="Restaurar dados de exemplo?"
        mensagem="Todos os produtos, fotos enviadas e configurações voltam ao padrão."
        textoConfirmar="Restaurar"
        perigo
        onConfirmar={async () => {
          await api.restaurarPadrao()
          setForm(paraFormulario(configInicial))
          toast.success('Dados restaurados')
        }}
      />
    </div>
  )
}
