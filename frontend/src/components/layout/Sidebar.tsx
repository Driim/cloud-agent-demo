import { NavLink } from 'react-router'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: 'ri-dashboard-line' },
  { to: '/costs', label: 'Usage & Costs', icon: 'ri-money-dollar-circle-line' },
  { to: '/sessions', label: 'Agent Sessions', icon: 'ri-robot-line' },
  { to: '/team', label: 'Team Activity', icon: 'ri-team-line' },
] as const

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-gray-900 flex flex-col z-10">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-white font-bold text-lg tracking-tight">AgentCloud</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              ].join(' ')
            }
          >
            <i className={`${icon} text-lg`} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
