import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar } from './Avatar'
import { MenuIcon } from './icons'
import { useAuth } from '../context/AuthContext'

const HOME_SECTIONS = [
  { href: '#about', label: 'Our Mission' },
  { href: '#why-join', label: 'Why Join' },
  { href: '#pricing', label: 'Support Plans' },
  { href: '#goodie-box', label: 'Goodie Box' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  const linkClass = 'block py-2 text-slate-600 hover:text-slate-900 lg:inline lg:py-0'

  const links = user ? (
    <>
      <Link to="/feed" className={linkClass}>
        Feed
      </Link>
      {user.group && (
        <Link to="/group" className={linkClass}>
          My Circle
        </Link>
      )}
      <Link to="/blog" className={linkClass}>
        Blog
      </Link>
      <Link to="/goodie-box" className={linkClass}>
        Goodie Box
      </Link>
      <Link
        to={`/profile/${user.id}`}
        className="flex items-center gap-1.5 py-2 text-slate-600 hover:text-slate-900 lg:inline-flex lg:py-0"
      >
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size={7} />
        Profile
      </Link>
      {user.role === 'user' && (
        <Link to="/subscription" className={linkClass}>
          Subscription
        </Link>
      )}
      {user.role === 'admin' && (
        <Link to="/admin/dashboard" className={linkClass}>
          Admin
        </Link>
      )}
      <Button onClick={handleLogout} className="mt-2 w-full lg:mt-0 lg:w-auto">
        Log out
      </Button>
    </>
  ) : (
    <>
      <Link to="/blog" className={linkClass}>
        Blog
      </Link>
      <Link to="/goodie-box" className={linkClass}>
        Goodie Box
      </Link>
      <Link to="/login" className={linkClass}>
        Log in
      </Link>
      <Button asChild className="mt-2 w-full lg:mt-0 lg:w-auto">
        <Link to="/register">Join now</Link>
      </Button>
    </>
  )

  return (
    <nav className="border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to={user ? '/feed' : '/'} className="font-semibold text-slate-900">
          Haven Circle
        </Link>

        <div className="hidden items-center gap-4 text-sm lg:flex">
          {isHome && (
            <>
              {HOME_SECTIONS.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className="text-slate-500 hover:text-slate-900"
                >
                  {section.label}
                </a>
              ))}
              <span className="h-4 w-px bg-slate-200" />
            </>
          )}
          {links}
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pb-4 text-sm">
              {isHome && (
                <div className="mb-2 flex flex-col border-b border-slate-200 pb-2">
                  {HOME_SECTIONS.map((section) => (
                    <a
                      key={section.href}
                      href={section.href}
                      className="py-2 text-slate-500 hover:text-slate-900"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              )}
              <div className="flex flex-col">{links}</div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
