// TODO: replace with real user profile from GET /auth/me once auth context is wired up
const ORG_NAME = 'Acme Corp'
const USER_EMAIL = 'admin@acme.corp'
const USER_ROLE = 'Admin'

function Header() {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <span className="font-semibold text-gray-800">{ORG_NAME}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{USER_EMAIL}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
          {USER_ROLE}
        </span>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
          {USER_EMAIL[0].toUpperCase()}
        </div>
      </div>
    </header>
  )
}

export default Header
