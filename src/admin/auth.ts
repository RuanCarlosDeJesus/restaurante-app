import { useSyncExternalStore } from 'react'

/**
 * Login master do painel (provisório, sem banco de dados).
 *
 * ATENÇÃO: isto roda só no navegador, então NÃO é segurança de verdade —
 * serve para organizar o fluxo e as telas. Quem entende de programação consegue
 * burlar. Quando entrar o backend, a verificação passa para o servidor
 * (ex.: Supabase Auth) e este arquivo é substituído.
 *
 * Para trocar a senha: gere o SHA-256 da nova senha
 *   node -e "console.log(require('crypto').createHash('sha256').update('NOVA_SENHA').digest('hex'))"
 * e cole em `senhaHash`.
 */
const ADMIN = {
  nome: 'Administrador',
  email: 'admin@saborecia.com',
  senhaHash: 'd86d0f255fa9351a98b7187775c459313c81dd1072f7ab2c6f57ff2eb0f934a5',
}

const CHAVE_SESSAO = 'saborecia:sessao-admin'
const CHAVE_TENTATIVAS = 'saborecia:tentativas-login'
const MAX_TENTATIVAS = 5
const BLOQUEIO_MS = 60_000
const SESSAO_CURTA_MS = 8 * 60 * 60 * 1000
const SESSAO_LONGA_MS = 30 * 24 * 60 * 60 * 1000

export interface Sessao {
  nome: string
  email: string
  expiraEm: number
}

function lerSessao(): Sessao | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO) ?? localStorage.getItem(CHAVE_SESSAO)
    if (!bruto) return null
    const sessao = JSON.parse(bruto) as Sessao
    return sessao.expiraEm > Date.now() ? sessao : null
  } catch {
    return null
  }
}

let sessaoAtual = lerSessao()
const ouvintes = new Set<() => void>()

function atualizar() {
  sessaoAtual = lerSessao()
  ouvintes.forEach((ouvinte) => ouvinte())
}

window.addEventListener('storage', (evento) => {
  if (evento.key === CHAVE_SESSAO) atualizar()
})

export function useSessao() {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte)
      return () => ouvintes.delete(ouvinte)
    },
    () => sessaoAtual,
  )
}

async function sha256(texto: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

interface Tentativas {
  falhas: number
  bloqueadoAte: number
}

function lerTentativas(): Tentativas {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_TENTATIVAS) ?? '') as Tentativas
  } catch {
    return { falhas: 0, bloqueadoAte: 0 }
  }
}

/** Milissegundos restantes de bloqueio após muitas senhas erradas. */
export function tempoDeBloqueio() {
  return Math.max(0, lerTentativas().bloqueadoAte - Date.now())
}

function registrarFalha() {
  const { falhas } = lerTentativas()
  const novas = falhas + 1
  localStorage.setItem(
    CHAVE_TENTATIVAS,
    JSON.stringify(
      novas >= MAX_TENTATIVAS
        ? { falhas: 0, bloqueadoAte: Date.now() + BLOQUEIO_MS }
        : { falhas: novas, bloqueadoAte: 0 },
    ),
  )
  return MAX_TENTATIVAS - novas
}

export async function entrar(email: string, senha: string, lembrar: boolean) {
  const bloqueio = tempoDeBloqueio()
  if (bloqueio > 0) {
    throw new Error(`Muitas tentativas. Tente de novo em ${Math.ceil(bloqueio / 1000)} s.`)
  }

  // Pequena espera, como num servidor real (também atrasa quem tenta adivinhar a senha)
  await new Promise((resolver) => setTimeout(resolver, 600))

  const correto =
    email.trim().toLowerCase() === ADMIN.email && (await sha256(senha)) === ADMIN.senhaHash

  if (!correto) {
    const restantes = registrarFalha()
    throw new Error(
      restantes > 0 && restantes <= 2
        ? `E-mail ou senha incorretos. ${restantes} tentativa(s) antes do bloqueio.`
        : restantes <= 0
          ? 'Muitas tentativas. Acesso bloqueado por 1 minuto.'
          : 'E-mail ou senha incorretos.',
    )
  }

  localStorage.removeItem(CHAVE_TENTATIVAS)
  const sessao: Sessao = {
    nome: ADMIN.nome,
    email: ADMIN.email,
    expiraEm: Date.now() + (lembrar ? SESSAO_LONGA_MS : SESSAO_CURTA_MS),
  }
  // "Manter conectado" sobrevive a fechar o navegador; sem ele, a sessão morre com a aba
  ;(lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, JSON.stringify(sessao))
  atualizar()
}

export function sair() {
  sessionStorage.removeItem(CHAVE_SESSAO)
  localStorage.removeItem(CHAVE_SESSAO)
  atualizar()
}
