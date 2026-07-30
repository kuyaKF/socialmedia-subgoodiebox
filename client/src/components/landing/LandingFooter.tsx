import { Link } from 'react-router-dom'
import { FacebookIcon, InstagramIcon, XSocialIcon } from '../icons'

const SOCIAL_LINKS = [
  { label: 'X (Twitter)', icon: XSocialIcon, href: '#' },
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 text-center text-xs text-slate-400">
        <p>
          Haven Circle offers peer support and awareness, not emergency care. If you or someone
          you know is in crisis, call the NCMH Crisis Hotline (1553) or your local emergency
          services.
        </p>
      </div>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Haven Circle. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link to="/terms" className="hover:text-slate-700">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-slate-700">
            Privacy
          </Link>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-slate-400 hover:text-slate-700"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
