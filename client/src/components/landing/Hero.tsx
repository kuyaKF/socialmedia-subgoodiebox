import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HeroBackground } from '../HeroBackground'
import { TypewriterHeadline } from './TypewriterHeadline'

const HEADLINE_SLOGANS = [
  "You don't have to carry it alone.",
  "It's okay to not be okay right now.",
  "Healing isn't linear — and neither are you.",
]

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative min-h-144 overflow-hidden bg-[#fbf8f3] px-4 py-16 sm:py-24">
      <HeroBackground />

      <div className="stationery-card relative mx-auto max-w-xl rounded-[1.75rem] px-7 py-10 text-center sm:px-12 sm:py-14">
        <p className="font-script text-5xl text-[#2C4870] sm:text-6xl">Haven Circle</p>
        <p className="font-body mt-1 text-[11px] font-semibold tracking-[0.2em] text-[#4B5A73] uppercase">
          A peer support community
        </p>

        <h1 className="font-body mt-8 min-h-18 text-3xl font-extrabold tracking-tight text-[#2C4870] sm:min-h-24 sm:text-[2.5rem]">
          <TypewriterHeadline phrases={HEADLINE_SLOGANS} />
        </h1>
        <p className="font-body mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#4B5A73]">
          Haven Circle places you in a private peer-support circle — a small group of people who
          get it, with a peer support lead looking out for you. Not another app to scroll. A
          circle to belong to.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link
              to="/feed"
              className="font-body rounded-full bg-[#2C4870] px-7 py-3 text-sm font-semibold text-[#FFFDF9] shadow-[0_8px_20px_rgba(44,72,112,0.3)] transition-transform hover:-translate-y-0.5"
            >
              Go to your community
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="font-body rounded-full bg-[#2C4870] px-7 py-3 text-sm font-semibold text-[#FFFDF9] shadow-[0_8px_20px_rgba(44,72,112,0.3)] transition-transform hover:-translate-y-0.5"
              >
                Join our circle
              </Link>
              <Link
                to="/login"
                className="font-body rounded-full border border-[#2C4870]/25 px-7 py-3 text-sm font-semibold text-[#2C4870] transition-colors hover:bg-[#2C4870]/5"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
