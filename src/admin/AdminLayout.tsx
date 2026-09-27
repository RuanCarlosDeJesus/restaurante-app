import clsx from 'clsx'
import {
  ChefHat,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { Suspense, useEffect, useRef } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { usePedidos } from '../services/db'
import { iniciais } from '../utils/formatar'
import { sair, useSessao } from './auth'
import { InterruptorLoja } from './ui'

const menu: { para: string; rotulo: string; curto: string; icone: LucideIcon; fim?: boolean }[] = [
  { para: '/admin', rotulo: 'Visão geral', curto: 'Início', icone: LayoutDashboard, fim: true },
  { para: '/admin/pedidos', rotulo: 'Pedidos', curto: 'Pedidos', icone: ClipboardList },
  { para: '/admin/cardapio', rotulo: 'Cardápio', curto: 'Cardápio', icone: UtensilsCrossed },
  { para: '/admin/loja', rotulo: 'Loja e horários', curto: 'Loja', icone: Settings },
]

function tocarAlerta() {
  try {
    const audio = new AudioContext()
    ;[880, 1175].forEach((frequencia, i) => {
      const oscilador = audio.createOscillator()
      const volume = audio.createGain()
      oscilador.frequency.value = frequencia
      oscilador.connect(volume)
      volume.connect(audio.destination)
      const inicio = audio.currentTime + i * 0.18
      volume.gain.setValueAtTime(0.18, inicio)
      volume.gain.exponentialRampToValueAtTime(0.001, inicio + 0.35)
      oscilador.start(inicio)
      oscilador.stop(inicio + 0.35)
    })
  } catch {
    // Navegador sem áudio ou sem interação prévia: só o aviso visual aparece
  }
}

export default function AdminLayout() {
  const sessao = useSessao()
  const local = useLocation()
  const navegar = useNavigate()
  const pedidos = usePedidos()
  const novos = pedidos.filter((p) => p.status === 'novo')
  const idsConhecidos = useRef<Set<string> | null>(null)

  // Avisa (toast + som) quando chega pedido novo — em outra aba ou, no futuro, pelo backend
  useEffect(() => {
    const ids = new Set(pedidos.map((p) => p.id))
    if (idsConhecidos.current) {
      const chegaram = pedidos.filter((p) => !idsConhecidos.current!.has(p.id))
      chegaram.forEach((pedido) => {
        tocarAlerta()
        toast.info(`Novo pedido #${pedido.numero}`, {
          description: `${pedido.cliente.nome} · ${pedido.tipo === 'entrega' ? 'Entrega' : 'Retirada'}`,
          action: { label: 'Ver', onClick: () => navegar('/admin/pedidos') },
          duration: 10_000,
        })
      })
    }
    idsConhecidos.current = ids
  }, [pedidos, navegar])

  useEffect(() => {
    document.title = novos.length > 0 ? `(${novos.length}) Pedidos novos · Painel` : 'Painel · Sabor & Cia'
  }, [novos.length])

  // Encerra a sessão quando ela expira com o painel aberto
  useEffect(() => {
    if (!sessao) return
    const intervalo = setInterval(() => {
      if (sessao.expiraEm <= Date.now()) {
        sair()
        toast.warning('Sua sessão expirou. Entre novamente.')
      }
    }, 30_000)
    return () => clearInterval(intervalo)
  }, [sessao])

  if (!sessao) return <Navigate to="/admin/login" replace state={{ de: local.pathname }} />

  function encerrar() {
    sair()
    toast('Você saiu do painel.')
  }

  return (
    <div className="min-h-dvh bg-stone-100/70">
      {/* Menu lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-900/5 bg-white lg:flex">
        <Link to="/admin" className="flex h-16 items-center gap-2.5 px-6">
          <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30">
            <ChefHat className="size-4.5" />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold leading-none">Sabor & Cia</span>
            <span className="text-xs text-stone-400">Painel do restaurante</span>
          </span>
        </Link>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {menu.map(({ para, rotulo, icone: Icone, fim }) => (
            <NavLink
              key={para}
              to={para}
              end={fim}
              className={({ isActive }) =>
                clsx(
                  'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition',
                  isActive ? 'bg-orange-50 text-orange-700' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
                )
              }
            >
              <Icone className="size-4.5" />
              <span className="flex-1">{rotulo}</span>
              {para === '/admin/pedidos' && novos.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1.5 text-[11px] font-bold text-white">
                  {novos.length}
                </span>
              )}
            </NavLink>
          ))}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
          >
            <ExternalLink className="size-4.5" />
            Ver loja
          </Link>
        </nav>

        <div className="m-3 rounded-2xl bg-stone-50 p-3">
          <InterruptorLoja compacto />
        </div>

        <div className="flex items-center gap-3 border-t border-stone-900/5 p-4">
          <span className="grid size-9 place-items-center rounded-full bg-stone-900 text-xs font-bold text-white">
            {iniciais(sessao.nome)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{sessao.nome}</p>
            <p className="truncate text-xs text-stone-400">{sessao.email}</p>
          </div>
          <button
            onClick={encerrar}
            aria-label="Sair"
            title="Sair"
            className="grid size-9 place-items-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Barra superior (celular/tablet) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-900/5 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-orange-500 to-rose-500 text-white">
            <ChefHat className="size-4" />
          </span>
          <span className="font-display font-semibold">Painel</span>
        </Link>
        <div className="flex items-center gap-1">
          <InterruptorLoja compacto />
          <button
            onClick={encerrar}
            aria-label="Sair"
            className="ml-2 grid size-9 place-items-center rounded-full text-stone-500 transition hover:bg-stone-100"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <Suspense
            fallback={
              <div className="grid h-64 place-items-center">
                <span className="size-7 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Navegação inferior (celular/tablet) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-stone-900/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {menu.map(({ para, curto, icone: Icone, fim }) => (
          <NavLink
            key={para}
            to={para}
            end={fim}
            className={({ isActive }) =>
              clsx(
                'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition',
                isActive ? 'text-orange-600' : 'text-stone-400',
              )
            }
          >
            <span className="relative">
              <Icone className="size-5" />
              {para === '/admin/pedidos' && novos.length > 0 && (
                <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white">
                  {novos.length}
                </span>
              )}
            </span>
            {curto}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
