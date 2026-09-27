import { AlertCircle, ArrowLeft, ChefHat, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { entrar, tempoDeBloqueio, useSessao } from './auth'

const imagemLateral =
  'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&q=80&auto=format&fit=crop'

export default function AdminLogin() {
  const sessao = useSessao()
  const navegar = useNavigate()
  const destino = (useLocation().state as { de?: string } | null)?.de ?? '/admin'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(true)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [bloqueio, setBloqueio] = useState(tempoDeBloqueio)

  useEffect(() => {
    if (bloqueio <= 0) return
    const intervalo = setInterval(() => setBloqueio(tempoDeBloqueio()), 1000)
    return () => clearInterval(intervalo)
  }, [bloqueio])

  useEffect(() => {
    document.title = 'Entrar · Painel'
  }, [])

  if (sessao) return <Navigate to={destino} replace />

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.')
      setTentativa((t) => t + 1)
      return
    }
    setCarregando(true)
    setErro('')
    try {
      await entrar(email, senha, lembrar)
      navegar(destino, { replace: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
      setTentativa((t) => t + 1)
      setSenha('')
      setBloqueio(tempoDeBloqueio())
    } finally {
      setCarregando(false)
    }
  }

  const bloqueado = bloqueio > 0

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={imagemLateral} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/60 to-stone-950/20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <span className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-linear-to-br from-orange-500 to-rose-500 shadow-lg">
              <ChefHat className="size-5" />
            </span>
            <span className="font-display text-xl font-semibold">Sabor & Cia</span>
          </span>
          <div>
            <p className="font-display text-4xl font-semibold leading-tight">
              Seu restaurante, <span className="italic text-orange-400">na palma da mão.</span>
            </p>
            <p className="mt-4 max-w-md text-stone-300">
              Receba pedidos, atualize o cardápio, marque o que esgotou e abra ou feche a loja com um toque.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-500 transition hover:text-stone-900"
        >
          <ArrowLeft className="size-4" /> Voltar para a loja
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="m-auto w-full max-w-sm py-10"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-orange-600 lg:hidden">
            <ChefHat className="size-6" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight lg:mt-0">Área do restaurante</h1>
          <p className="mt-1.5 text-sm text-stone-500">Entre com a conta de administrador.</p>

          <form onSubmit={enviar} className="mt-8 space-y-4" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-stone-700">E-mail</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  placeholder="admin@seurestaurante.com"
                  className="h-12 w-full rounded-2xl border-0 bg-stone-50 pl-11 pr-4 text-sm ring-1 ring-stone-900/10 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-stone-700">Senha</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border-0 bg-stone-50 pl-11 pr-12 text-sm ring-1 ring-stone-900/10 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((m) => !m)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                >
                  {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                className="size-4 rounded accent-orange-600"
              />
              Manter conectado neste aparelho
            </label>

            <AnimatePresence>
              {(erro || bloqueado) && (
                <motion.p
                  key={tentativa}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {bloqueado ? `Muitas tentativas. Tente de novo em ${Math.ceil(bloqueio / 1000)} s.` : erro}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={carregando || bloqueado}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              {carregando && <Loader2 className="size-4 animate-spin" />}
              {carregando ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
