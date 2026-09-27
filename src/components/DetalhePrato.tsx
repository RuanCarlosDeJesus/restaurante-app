import clsx from 'clsx'
import { Check, Minus, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { rotuloCategoria } from '../data/seed'
import type { Opcao, Produto } from '../types'
import { formatarPreco } from '../utils/formatar'
import { ImagemPrato } from './ui/ImagemPrato'
import { Modal } from './ui/Modal'

interface DetalhePratoProps {
  produto: Produto | null
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  onAdicionar: (produto: Produto, tamanho: Opcao, adicionais: Opcao[], quantidade: number) => void
}

export function DetalhePrato({ produto, aberto, onAbertoChange, onAdicionar }: DetalhePratoProps) {
  const [quantidade, setQuantidade] = useState(1)
  const [tamanhoId, setTamanhoId] = useState(produto?.tamanhos[0]?.id)
  const [adicionaisIds, setAdicionaisIds] = useState<string[]>([])

  if (!produto) return null

  const tamanho = produto.tamanhos.find((t) => t.id === tamanhoId) ?? produto.tamanhos[0]
  const adicionais = produto.adicionais.filter((a) => adicionaisIds.includes(a.id))
  const precoUnitario = tamanho.preco + adicionais.reduce((soma, a) => soma + a.preco, 0)

  function alternarAdicional(id: string) {
    setAdicionaisIds((atual) => (atual.includes(id) ? atual.filter((a) => a !== id) : [...atual, id]))
  }

  return (
    <Modal aberto={aberto} onAbertoChange={onAbertoChange} titulo={produto.nome} largura="max-w-lg">
      <div className={clsx('relative aspect-16/10', !produto.disponivel && 'grayscale')}>
        <ImagemPrato imagem={produto.imagem} nome={produto.nome} categoria={produto.categoria} iconeGrande />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent" />
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-orange-700">
            {rotuloCategoria(produto.categoria)}
          </span>
          {produto.selos.map((selo) => (
            <span key={selo} className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">
              {selo}
            </span>
          ))}
        </div>

        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-stone-900">
          {produto.nome}
        </h2>
        <p className="mt-2 leading-relaxed text-stone-500">{produto.descricao}</p>

        {produto.tamanhos.length > 1 && (
          <fieldset className="mt-6">
            <legend className="mb-2.5 flex w-full items-center justify-between text-sm font-bold text-stone-900">
              Escolha o tamanho
              <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Obrigatório
              </span>
            </legend>
            <div className="grid gap-2">
              {produto.tamanhos.map((opcao) => (
                <LinhaOpcao
                  key={opcao.id}
                  tipo="radio"
                  marcado={opcao.id === tamanho.id}
                  onClick={() => setTamanhoId(opcao.id)}
                  nome={opcao.nome}
                  preco={formatarPreco(opcao.preco)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {produto.adicionais.length > 0 && (
          <fieldset className="mt-6">
            <legend className="mb-2.5 flex w-full items-center justify-between text-sm font-bold text-stone-900">
              Adicionais
              <span className="text-xs font-medium text-stone-400">Opcional</span>
            </legend>
            <div className="grid gap-2">
              {produto.adicionais.map((opcao) => (
                <LinhaOpcao
                  key={opcao.id}
                  tipo="checkbox"
                  marcado={adicionaisIds.includes(opcao.id)}
                  onClick={() => alternarAdicional(opcao.id)}
                  nome={opcao.nome}
                  preco={`+ ${formatarPreco(opcao.preco)}`}
                />
              ))}
            </div>
          </fieldset>
        )}

        <div className="sticky bottom-0 -mx-6 mt-6 flex items-center gap-3 border-t border-stone-100 bg-white px-6 pt-5">
          {produto.disponivel ? (
            <>
              <div className="flex h-13 items-center gap-1 rounded-full bg-stone-100 p-1">
                <button
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                  disabled={quantidade === 1}
                  aria-label="Diminuir"
                  className="grid size-11 place-items-center rounded-full text-stone-700 transition hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Minus className="size-4" />
                </button>
                <motion.span
                  key={quantidade}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-6 text-center font-semibold tabular-nums"
                >
                  {quantidade}
                </motion.span>
                <button
                  onClick={() => setQuantidade((q) => q + 1)}
                  aria-label="Aumentar"
                  className="grid size-11 place-items-center rounded-full text-stone-700 transition hover:bg-white"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onAdicionar(produto, tamanho, adicionais, quantidade)
                  onAbertoChange(false)
                }}
                className="flex h-13 flex-1 items-center justify-between rounded-full bg-orange-600 px-6 text-sm font-semibold text-white shadow-xl shadow-orange-600/30 transition-colors hover:bg-orange-700"
              >
                <span>Adicionar</span>
                <span className="tabular-nums">{formatarPreco(precoUnitario * quantidade)}</span>
              </motion.button>
            </>
          ) : (
            <p className="flex h-13 flex-1 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-500">
              Esgotado no momento
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

interface LinhaOpcaoProps {
  tipo: 'radio' | 'checkbox'
  marcado: boolean
  onClick: () => void
  nome: string
  preco: string
}

function LinhaOpcao({ tipo, marcado, onClick, nome, preco }: LinhaOpcaoProps) {
  return (
    <button
      type="button"
      role={tipo}
      aria-checked={marcado}
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition',
        marcado ? 'bg-orange-50 ring-2 ring-orange-500' : 'bg-white ring-stone-900/10 hover:bg-stone-50',
      )}
    >
      <span
        className={clsx(
          'grid size-5 shrink-0 place-items-center border-2 transition',
          tipo === 'radio' ? 'rounded-full' : 'rounded-md',
          marcado ? 'border-orange-600 bg-orange-600 text-white' : 'border-stone-300',
        )}
      >
        {marcado &&
          (tipo === 'radio' ? (
            <span className="size-2 rounded-full bg-white" />
          ) : (
            <Check className="size-3.5" strokeWidth={3} />
          ))}
      </span>
      <span className="flex-1 text-sm font-semibold text-stone-800">{nome}</span>
      <span className="text-sm font-medium text-stone-500 tabular-nums">{preco}</span>
    </button>
  )
}
