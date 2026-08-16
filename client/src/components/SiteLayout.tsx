import { Outlet } from 'react-router-dom'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { Navbar } from './Navbar'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <EmailVerificationBanner />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
