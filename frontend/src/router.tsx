import { createBrowserRouter } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import OverviewPage from './pages/OverviewPage'
import CostsPage from './pages/CostsPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailPage from './pages/SessionDetailPage'
import TeamPage from './pages/TeamPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'costs', element: <CostsPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'sessions/:id', element: <SessionDetailPage /> },
      { path: 'team', element: <TeamPage /> },
    ],
  },
])

export default router
