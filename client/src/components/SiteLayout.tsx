import { Outlet } from 'react-router-dom'
import { EmailVerificationBanner } from './EmailVerificationBanner'
import { Navbar } from './Navbar'

export function SiteLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <EmailVerificationBanner />
      <Outlet />
    </div>
  )
}
