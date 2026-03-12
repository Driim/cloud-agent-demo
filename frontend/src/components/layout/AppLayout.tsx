import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-60 pt-14 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
