import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-amber-400/30 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
        <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          A safe space, always open
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          You don't have to carry it alone
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          Haven Circle connects you with a real peer-support group and a monthly care package at
          your door — because healing goes better with people beside you, not just another app to
          scroll.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link
              to="/feed"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-100"
            >
              Go to your community
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-100"
              >
                Join our circle
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
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
