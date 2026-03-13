import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import ErrorBoundary from '../shared/ErrorBoundary'

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <Header />
      <main className="ml-60 pt-14 p-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default AppLayout
