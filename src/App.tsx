import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { useDesktop } from './hooks/useMediaQuery'
import { Loja } from './pages/Loja'

// O painel só é baixado por quem acessa /admin — o cliente da loja não carrega esse código
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Dashboard = lazy(() => import('./admin/paginas/Dashboard'))
const Pedidos = lazy(() => import('./admin/paginas/Pedidos'))
const CardapioAdmin = lazy(() => import('./admin/paginas/CardapioAdmin'))
const EditarProduto = lazy(() => import('./admin/paginas/EditarProduto'))
const ConfiguracoesLoja = lazy(() => import('./admin/paginas/ConfiguracoesLoja'))

function Carregando() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <span className="size-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
    </div>
  )
}

function App() {
  const desktop = useDesktop()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route path="/" element={<Loja />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="cardapio" element={<CardapioAdmin />} />
            <Route path="cardapio/novo" element={<EditarProduto />} />
            <Route path="cardapio/:id" element={<EditarProduto />} />
            <Route path="loja" element={<ConfiguracoesLoja />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position={desktop ? 'bottom-right' : 'top-center'}
        richColors
        toastOptions={{ style: { borderRadius: '1rem', fontFamily: 'var(--font-sans)' } }}
      />
    </BrowserRouter>
  )
}

export default App
