import { Link } from 'react-router-dom'
import { FacebookIcon, InstagramIcon, XSocialIcon } from '../icons'

const SOCIAL_LINKS = [
  { label: 'X (Twitter)', icon: XSocialIcon, href: '#' },
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
]

export function LandingFooter() {
  return (
    <footer className="bg-wash-sage px-4 pt-10 pb-8">
      <p className="font-script mx-auto block text-center text-3xl text-[#2C4870]">Haven Circle</p>

      <div className="stationery-card mx-auto mt-6 max-w-2xl rounded-2xl px-6 py-4 text-center">
        <p className="font-body text-xs leading-relaxed text-[#4B5A73]">
          Haven Circle offers peer support and awareness, not emergency care. If you or someone
          you know is in crisis, call the NCMH Crisis Hotline (1553) or your local emergency
          services.
        </p>
      </div>
      <div className="font-body mx-auto mt-8 flex max-w-5xl flex-col items-center gap-4 text-sm text-[#4B5A73] sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Haven Circle. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link to="/terms" className="hover:text-[#2C4870]">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-[#2C4870]">
            Privacy
          </Link>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
              <a key={label} href={href} aria-label={label} className="text-[#4B5A73] hover:text-[#2C4870]">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
