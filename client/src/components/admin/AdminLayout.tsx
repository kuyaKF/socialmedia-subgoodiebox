import { GiftIcon, LayoutDashboardIcon, LogOutIcon, NotebookPenIcon, UsersIcon } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/admin/groups', label: 'Groups', icon: UsersIcon },
  { to: '/admin/goodie-box-orders', label: 'Goodie Box Orders', icon: GiftIcon },
  { to: '/admin/blog/new', label: 'Blog', icon: NotebookPenIcon },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg">
                  <Link to="/feed">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                      HC
                    </span>
                    <span className="truncate font-semibold">Haven Circle</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname.startsWith(item.to.replace(/\/new$/, ''))
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link to={item.to}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Log out" onClick={handleLogout}>
                  <LogOutIcon />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
          </header>
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
