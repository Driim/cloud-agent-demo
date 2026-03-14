import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import LoadingSkeleton from './components/shared/LoadingSkeleton'

const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const CostsPage = lazy(() => import('./pages/CostsPage'))
const SessionsPage = lazy(() => import('./pages/SessionsPage'))
const SessionDetailPage = lazy(() => import('./pages/SessionDetailPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))

function SuspenseWrapper({ children }: { readonly children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSkeleton lines={6} />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <SuspenseWrapper><OverviewPage /></SuspenseWrapper> },
      { path: 'costs', element: <SuspenseWrapper><CostsPage /></SuspenseWrapper> },
      { path: 'sessions', element: <SuspenseWrapper><SessionsPage /></SuspenseWrapper> },
      { path: 'sessions/:id', element: <SuspenseWrapper><SessionDetailPage /></SuspenseWrapper> },
      { path: 'team', element: <SuspenseWrapper><TeamPage /></SuspenseWrapper> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default router
