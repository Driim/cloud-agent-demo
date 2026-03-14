import UserAvatar from '../shared/UserAvatar'

// TODO: replace with real user profile from GET /auth/me once auth context is wired up
const ORG_NAME = 'Acme Corp'
const USER_EMAIL = 'admin@acme.corp'
const USER_ROLE = 'Admin'

function Header() {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 z-10">
      <span className="font-semibold text-white">{ORG_NAME}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-400">{USER_EMAIL}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ai-purple/15 text-ai-purple">
          {USER_ROLE}
        </span>
        <UserAvatar name={USER_EMAIL} />
      </div>
    </header>
  )
}

export default Header
