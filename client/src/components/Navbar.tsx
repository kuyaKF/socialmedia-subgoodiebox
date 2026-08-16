import { useEffect, useState, type ComponentType } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar } from './Avatar'
import { BookIcon, GearIcon, GiftIcon, HeartIcon, HomeIcon, MenuIcon, UsersIcon } from './icons'
import { useAuth } from '../context/AuthContext'

const HOME_SECTIONS = [
  { href: '#about', label: 'Our Mission' },
  { href: '#why-join', label: 'Why Join' },
  { href: '#pricing', label: 'Support Plans' },
  { href: '#goodie-box', label: 'Goodie Box' },
  { href: '#faq', label: 'FAQ' },
]

type NavItem = {
  to: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

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

  function linkClass(href: string) {
    const active = isActivePath(location.pathname, href)
    return `block py-2 lg:inline lg:py-0 transition-colors ${
      active ? 'font-semibold text-[#2C4870]' : 'text-slate-600 hover:text-[#2C4870]'
    }`
  }

  const links = user ? (
    <>
      <Link to="/feed" className={linkClass('/feed')}>
        Feed
      </Link>
      {user.group && (
        <Link to="/group" className={linkClass('/group')}>
          My Circle
        </Link>
      )}
      <Link to="/blog" className={linkClass('/blog')}>
        Blog
      </Link>
      <Link to="/goodie-box" className={linkClass('/goodie-box')}>
        Goodie Box
      </Link>
      <Link
        to={`/profile/${user.id}`}
        className={`flex items-center gap-1.5 py-2 lg:inline-flex lg:py-0 transition-colors ${
          isActivePath(location.pathname, '/profile')
            ? 'font-semibold text-[#2C4870]'
            : 'text-slate-600 hover:text-[#2C4870]'
        }`}
      >
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size={7} className="ring-2 ring-[#8FAE86]/30" />
        Profile
      </Link>
      {user.role === 'user' && (
        <Link to="/subscription" className={linkClass('/subscription')}>
          Subscription
        </Link>
      )}
      {user.role === 'admin' && (
        <Link to="/admin/dashboard" className={linkClass('/admin')}>
          Admin
        </Link>
      )}
      <Button onClick={handleLogout} className="mt-2 w-full rounded-full lg:mt-0 lg:w-auto">
        Log out
      </Button>
    </>
  ) : (
    <>
      <Link to="/blog" className={linkClass('/blog')}>
        Blog
      </Link>
      <Link to="/goodie-box" className={linkClass('/goodie-box')}>
        Goodie Box
      </Link>
      <Link to="/login" className={linkClass('/login')}>
        Log in
      </Link>
      <Button asChild className="mt-2 w-full rounded-full lg:mt-0 lg:w-auto">
        <Link to="/register">Join now</Link>
      </Button>
    </>
  )

  const mobileItems: NavItem[] = user
    ? [
        { to: '/feed', label: 'Feed', icon: HomeIcon },
        ...(user.group ? [{ to: '/group', label: 'My Circle', icon: UsersIcon }] : []),
        { to: '/blog', label: 'Blog', icon: BookIcon },
        { to: '/goodie-box', label: 'Goodie Box', icon: GiftIcon },
        ...(user.role === 'user'
          ? [{ to: '/subscription', label: 'Subscription', icon: HeartIcon }]
          : []),
        ...(user.role === 'admin'
          ? [{ to: '/admin/dashboard', label: 'Admin', icon: GearIcon }]
          : []),
      ]
    : [
        { to: '/blog', label: 'Blog', icon: BookIcon },
        { to: '/goodie-box', label: 'Goodie Box', icon: GiftIcon },
        { to: '/login', label: 'Log in' },
      ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-900/5 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8FAE86]/20 text-[#2C4870]">
            <UsersIcon className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-[#2C4870]">Haven Circle</span>
        </Link>

        <div className="hidden items-center gap-4 text-sm lg:flex">
          {isHome && (
            <>
              {HOME_SECTIONS.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className="text-slate-500 transition-colors hover:text-[#2C4870]"
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
          <SheetContent side="right" className="p-0">
            <SheetHeader className="border-b border-slate-900/5 pr-14">
              {user ? (
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-3 rounded-lg py-1 transition-opacity hover:opacity-80"
                >
                  <Avatar
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    size={9}
                    className="ring-2 ring-[#8FAE86]/30"
                  />
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-base text-[#2C4870]">
                      {user.name}
                    </SheetTitle>
                    <p className="text-xs text-slate-500 capitalize">
                      {user.role === 'user' ? 'Member' : user.role}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8FAE86]/20 text-[#2C4870]">
                    <UsersIcon className="h-4 w-4" />
                  </span>
                  <SheetTitle className="text-base text-[#2C4870]">Haven Circle</SheetTitle>
                </div>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-3 py-2 text-sm">
              {isHome && (
                <div className="mb-3">
                  <p className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                    Explore
                  </p>
                  <div className="flex flex-col">
                    {HOME_SECTIONS.map((section) => (
                      <a
                        key={section.href}
                        href={section.href}
                        className="rounded-lg px-2.5 py-2.5 text-slate-600 transition-colors hover:bg-[#2C4870]/5 hover:text-[#2C4870]"
                      >
                        {section.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                {mobileItems.map(({ to, label, icon: Icon }) => {
                  const active = isActivePath(location.pathname, to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors ${
                        active
                          ? 'bg-[#2C4870]/5 font-semibold text-[#2C4870]'
                          : 'text-slate-600 hover:bg-[#2C4870]/5 hover:text-[#2C4870]'
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <SheetFooter className="border-t border-slate-900/5">
              {user ? (
                <Button onClick={handleLogout} className="w-full rounded-full">
                  Log out
                </Button>
              ) : (
                <Button asChild className="w-full rounded-full">
                  <Link to="/register">Join now</Link>
                </Button>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
