import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from './Avatar'
import { useAuth } from '../context/AuthContext'

const HOME_SECTIONS = [
  { href: '#about', label: 'Our Mission' },
  { href: '#why-join', label: 'Why Join' },
  { href: '#pricing', label: 'Support Plans' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to={user ? '/feed' : '/'} className="font-semibold text-slate-900">
          Haven Circle
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {isHome && (
            <>
              {HOME_SECTIONS.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className="hidden text-slate-500 hover:text-slate-900 lg:inline"
                >
                  {section.label}
                </a>
              ))}
              <span className="hidden h-4 w-px bg-slate-200 lg:inline-block" />
            </>
          )}
          {user ? (
            <>
              <Link to="/feed" className="text-slate-600 hover:text-slate-900">
                Feed
              </Link>
              {user.group && (
                <Link to="/group" className="text-slate-600 hover:text-slate-900">
                  My Circle
                </Link>
              )}
              <Link to="/blog" className="text-slate-600 hover:text-slate-900">
                Blog
              </Link>
              <Link to="/goodie-box" className="text-slate-600 hover:text-slate-900">
                Goodie Box
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
              >
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size={7} />
                Profile
              </Link>
              {user.role === 'user' && (
                <Link to="/subscription" className="text-slate-600 hover:text-slate-900">
                  Subscription
                </Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="text-slate-600 hover:text-slate-900">
                    Dashboard
                  </Link>
                  <Link to="/admin/groups" className="text-slate-600 hover:text-slate-900">
                    Manage Groups
                  </Link>
                  <Link
                    to="/admin/goodie-box-orders"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Goodie Box Orders
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="rounded bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/blog" className="text-slate-600 hover:text-slate-900">
                Blog
              </Link>
              <Link to="/goodie-box" className="text-slate-600 hover:text-slate-900">
                Goodie Box
              </Link>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
