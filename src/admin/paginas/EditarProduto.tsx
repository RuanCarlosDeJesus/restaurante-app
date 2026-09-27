import clsx from 'clsx'
import { AlertCircle, ArrowLeft, ImagePlus, Link2, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState, type DragEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { ImagemPrato, iconesCategoria } from '../../components/ui/ImagemPrato'
import { categorias, selosDisponiveis } from '../../data/seed'
import { api, useProdutos } from '../../services/db'
import type { Categoria, Produto } from '../../types'
import { comprimirImagem } from '../../utils/imagem'
import { Campo, Cartao, classeCampo, Confirmar, Switch } from '../ui'

interface LinhaOpcao {
  id: string
  nome: string
  preco: string
}

interface Formulario {
  nome: string
  descricao: string
  categoria: Categoria
  imagem: string | null
  tamanhos: LinhaOpcao[]
  adicionais: LinhaOpcao[]
  selos: string[]
  disponivel: boolean
  visivel: boolean
}

const novaLinha = (): LinhaOpcao => ({ id: crypto.randomUUID().slice(0, 8), nome: '', preco: '' })
const precoParaTexto = (preco: number) => preco.toFixed(2).replace('.', ',')
const textoParaPreco = (texto: string) => Number(texto.replace(/\./g, '').replace(',', '.'))

function paraFormulario(produto?: Produto): Formulario {
  if (!produto) {
    return {
      nome: '',
      descricao: '',
      categoria: 'batatas',
      imagem: null,
      tamanhos: [{ ...novaLinha(), nome: 'Único' }],
      adicionais: [],
      selos: [],
      disponivel: true,
      visivel: true,
    }
  }
  const linha = (o: { id: string; nome: string; preco: number }) => ({ ...o, preco: precoParaTexto(o.preco) })
  return {
    ...produto,
    tamanhos: produto.tamanhos.map(linha),
    adicionais: produto.adicionais.map(linha),
  }
}

export default function EditarProduto() {
  const { id } = useParams()
  const produtos = useProdutos()
  const produto = id ? produtos.find((p) => p.id === id) : undefined

  if (id && !produto) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-stone-900/5">
        <p className="font-semibold">Produto não encontrado</p>
        <Link to="/admin/cardapio" className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:underline">
          Voltar ao cardápio
        </Link>
      </div>
    )
  }

  return <FormularioProduto key={id ?? 'novo'} produto={produto} />
}

function FormularioProduto({ produto }: { produto?: Produto }) {
  const navegar = useNavigate()
  const [form, setForm] = useState(() => paraFormulario(produto))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [processandoFoto, setProcessandoFoto] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const [linkFoto, setLinkFoto] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const entradaArquivo = useRef<HTMLInputElement>(null)

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function alterarLinha(lista: 'tamanhos' | 'adicionais', indice: number, campo: 'nome' | 'preco', valor: string) {
    const limpo = campo === 'preco' ? valor.replace(/[^\d,]/g, '') : valor
    setForm((atual) => ({
      ...atual,
      [lista]: atual[lista].map((l, i) => (i === indice ? { ...l, [campo]: limpo } : l)),
    }))
  }

  async function receberArquivo(arquivo?: File) {
    if (!arquivo) return
    setProcessandoFoto(true)
    try {
      alterar('imagem', await comprimirImagem(arquivo))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível usar essa imagem.')
    } finally {
      setProcessandoFoto(false)
    }
  }

  function soltar(evento: DragEvent) {
    evento.preventDefault()
    setArrastando(false)
    receberArquivo(evento.dataTransfer.files[0])
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    setErro('')

    if (form.nome.trim().length < 2) return setErro('Dê um nome ao produto.')
    const tamanhos = form.tamanhos.map((t) => ({ id: t.id, nome: t.nome.trim(), preco: textoParaPreco(t.preco) }))
    if (tamanhos.length === 0) return setErro('Cadastre pelo menos um tamanho com preço.')
    if (tamanhos.some((t) => !t.nome || !(t.preco > 0))) {
      return setErro('Todo tamanho precisa de nome e preço maior que zero.')
    }
    const adicionais = form.adicionais
      .filter((a) => a.nome.trim())
      .map((a) => ({ id: a.id, nome: a.nome.trim(), preco: textoParaPreco(a.preco) || 0 }))

    setSalvando(true)
    try {
      await api.salvarProduto({
        id: produto?.id,
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        imagem: form.imagem,
        tamanhos,
        adicionais,
        selos: form.selos,
        disponivel: form.disponivel,
        visivel: form.visivel,
      })
      toast.success(produto ? 'Alterações salvas' : 'Produto criado')
      navegar('/admin/cardapio')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} noValidate>
      <Link
        to="/admin/cardapio"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-stone-900"
      >
        <ArrowLeft className="size-4" /> Cardápio
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-semibold tracking-tight">
        {produto ? produto.nome : 'Novo produto'}
      </h1>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Cartao titulo="Informações">
            <div className="space-y-4">
              <Campo rotulo="Nome">
                <input
                  value={form.nome}
                  onChange={(e) => alterar('nome', e.target.value)}
                  placeholder="Ex.: Batata a Metro"
                  className={classeCampo}
                />
              </Campo>
              <Campo rotulo="Descrição" dica="Aparece no cardápio. Diga o que vem e para quantas pessoas serve.">
                <textarea
                  value={form.descricao}
                  onChange={(e) => alterar('descricao', e.target.value)}
                  rows={3}
                  placeholder="Ex.: Batata frita crocante servida na tábua, com 3 molhos da casa."
                  className={clsx(classeCampo, 'h-auto resize-none py-2.5')}
                />
              </Campo>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-stone-700">Categoria</span>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((c) => {
                    const Icone = iconesCategoria[c.valor]
                    return (
                      <button
                        key={c.valor}
                        type="button"
                        onClick={() => alterar('categoria', c.valor)}
                        className={clsx(
                          'flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition',
                          form.categoria === c.valor
                            ? 'bg-orange-50 text-orange-700 ring-2 ring-orange-500'
                            : 'text-stone-600 ring-1 ring-stone-900/10 hover:bg-stone-50',
                        )}
                      >
                        <Icone className="size-4" />
                        {c.rotulo}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Cartao>

          <ListaOpcoes
            titulo="Tamanhos e preços"
            descricao="Com um só tamanho o cliente não precisa escolher. Ex.: ½ metro e 1 metro."
            linhas={form.tamanhos}
            placeholderNome="Ex.: 1 metro"
            textoAdicionar="Adicionar tamanho"
            podeRemover={form.tamanhos.length > 1}
            onAlterar={(i, campo, valor) => alterarLinha('tamanhos', i, campo, valor)}
            onAdicionar={() => alterar('tamanhos', [...form.tamanhos, novaLinha()])}
            onRemover={(i) => alterar('tamanhos', form.tamanhos.filter((_, j) => j !== i))}
          />

          <ListaOpcoes
            titulo="Adicionais"
            descricao="Opcionais que somam no preço. Ex.: cheddar, bacon."
            linhas={form.adicionais}
            placeholderNome="Ex.: Cheddar cremoso"
            textoAdicionar="Adicionar adicional"
            podeRemover
            onAlterar={(i, campo, valor) => alterarLinha('adicionais', i, campo, valor)}
            onAdicionar={() => alterar('adicionais', [...form.adicionais, novaLinha()])}
            onRemover={(i) => alterar('adicionais', form.adicionais.filter((_, j) => j !== i))}
          />
        </div>

        <div className="space-y-6">
          <Cartao titulo="Foto">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setArrastando(true)
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={soltar}
              className={clsx(
                'relative aspect-4/3 overflow-hidden rounded-2xl transition',
                arrastando && 'ring-4 ring-orange-400',
              )}
            >
              {form.imagem ? (
                <>
                  <ImagemPrato key={form.imagem} imagem={form.imagem} nome={form.nome} categoria={form.categoria} iconeGrande />
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => entradaArquivo.current?.click()}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-white/90 px-3 text-xs font-semibold text-stone-800 shadow backdrop-blur transition hover:bg-white"
                    >
                      <Upload className="size-3.5" /> Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => alterar('imagem', null)}
                      aria-label="Remover foto"
                      className="grid size-8 place-items-center rounded-full bg-white/90 text-stone-700 shadow backdrop-blur transition hover:bg-white hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => entradaArquivo.current?.click()}
                  className="flex size-full flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 bg-stone-50 text-stone-500 transition hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600"
                >
                  <ImagePlus className="size-8" strokeWidth={1.5} />
                  <span className="text-sm font-semibold">Enviar foto</span>
                  <span className="text-xs text-stone-400">Clique ou arraste aqui</span>
                </button>
              )}
              {processandoFoto && (
                <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-orange-600" />
                </div>
              )}
            </div>
            <input
              ref={entradaArquivo}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                receberArquivo(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <p className="mt-2 text-xs text-stone-400">
              A foto é reduzida automaticamente. Prefira fotos na horizontal e bem iluminadas.
            </p>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                <input
                  value={linkFoto}
                  onChange={(e) => setLinkFoto(e.target.value)}
                  placeholder="ou cole o link de uma imagem"
                  className={clsx(classeCampo, 'h-10 pl-9 text-xs')}
                />
              </div>
              <button
                type="button"
                disabled={!/^https?:\/\//.test(linkFoto.trim())}
                onClick={() => {
                  alterar('imagem', linkFoto.trim())
                  setLinkFoto('')
                }}
                className="h-10 rounded-xl bg-stone-900 px-3 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-40"
              >
                Usar
              </button>
            </div>
          </Cartao>

          <Cartao titulo="Na loja">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Disponível</p>
                  <p className="text-xs text-stone-500">Desligado = aparece como esgotado</p>
                </div>
                <Switch ligado={form.disponivel} onChange={(v) => alterar('disponivel', v)} rotulo="Disponível" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Visível no cardápio</p>
                  <p className="text-xs text-stone-500">Desligado = escondido do cliente</p>
                </div>
                <Switch ligado={form.visivel} onChange={(v) => alterar('visivel', v)} rotulo="Visível" />
              </div>
            </div>
          </Cartao>

          <Cartao titulo="Selos" descricao="Destaques que aparecem sobre a foto">
            <div className="flex flex-wrap gap-2">
              {selosDisponiveis.map((selo) => {
                const ativo = form.selos.includes(selo)
                return (
                  <button
                    key={selo}
                    type="button"
                    onClick={() => alterar('selos', ativo ? form.selos.filter((s) => s !== selo) : [...form.selos, selo])}
                    className={clsx(
                      'h-8 rounded-full px-3 text-xs font-semibold transition',
                      ativo ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                    )}
                  >
                    {selo}
                  </button>
                )
              })}
            </div>
          </Cartao>

          {produto && (
            <button
              type="button"
              onClick={() => setExcluindo(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="size-4" /> Excluir produto
            </button>
          )}
        </div>
      </div>

      {/* Barra de salvar fixa */}
      <div className="sticky bottom-20 z-20 mt-6 lg:bottom-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-stone-900/5 backdrop-blur">
          {erro ? (
            <p className="flex flex-1 items-center gap-2 text-sm font-medium text-red-600">
              <AlertCircle className="size-4 shrink-0" /> {erro}
            </p>
          ) : (
            <p className="hidden flex-1 text-sm text-stone-500 sm:block">
              As alterações aparecem na loja assim que você salvar.
            </p>
          )}
          <Link
            to="/admin/cardapio"
            className="ml-auto flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-stone-600 transition hover:bg-stone-100"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={salvando || processandoFoto}
            className="flex h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
          >
            {salvando && <Loader2 className="size-4 animate-spin" />}
            {produto ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </div>
      </div>

      {produto && (
        <Confirmar
          aberto={excluindo}
          onAbertoChange={setExcluindo}
          titulo={`Excluir "${produto.nome}"?`}
          mensagem="Essa ação não pode ser desfeita."
          textoConfirmar="Excluir"
          perigo
          onConfirmar={async () => {
            await api.removerProduto(produto.id)
            toast.success(`${produto.nome} excluído`)
            navegar('/admin/cardapio')
          }}
        />
      )}
    </form>
  )
}

interface ListaOpcoesProps {
  titulo: string
  descricao: string
  linhas: LinhaOpcao[]
  placeholderNome: string
  textoAdicionar: string
  podeRemover: boolean
  onAlterar: (indice: number, campo: 'nome' | 'preco', valor: string) => void
  onAdicionar: () => void
  onRemover: (indice: number) => void
}

function ListaOpcoes(props: ListaOpcoesProps) {
  return (
    <Cartao titulo={props.titulo} descricao={props.descricao}>
      <div className="space-y-2">
        {props.linhas.map((linha, i) => (
          <div key={linha.id} className="flex items-center gap-2">
            <input
              value={linha.nome}
              onChange={(e) => props.onAlterar(i, 'nome', e.target.value)}
              placeholder={props.placeholderNome}
              aria-label="Nome"
              className={clsx(classeCampo, 'flex-1')}
            />
            <div className="relative w-32 shrink-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">R$</span>
              <input
                value={linha.preco}
                onChange={(e) => props.onAlterar(i, 'preco', e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                aria-label="Preço"
                className={clsx(classeCampo, 'pl-9 text-right tabular-nums')}
              />
            </div>
            <button
              type="button"
              onClick={() => props.onRemover(i)}
              disabled={!props.podeRemover}
              aria-label="Remover"
              className="grid size-11 shrink-0 place-items-center rounded-xl text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:invisible"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={props.onAdicionar}
        className="mt-3 flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
      >
        <Plus className="size-4" /> {props.textoAdicionar}
      </button>
    </Cartao>
  )
}
