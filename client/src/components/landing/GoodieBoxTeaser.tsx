import { Link } from 'react-router-dom'
import { CheckIcon, GiftIcon } from '../icons'

const FEATURES = ['Curated comfort items', 'A handwritten note', 'One-time purchase, ships once']

export function GoodieBoxTeaser() {
  return (
    <section id="goodie-box" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-[auto_1fr] sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white sm:h-16 sm:w-16">
            <GiftIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              No subscription required
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Not ready to join a circle? Try a Goodie Box first.
            </h2>
            <p className="mt-3 text-slate-600">
              A one-time comfort package, ₱799, delivered straight to your door — no membership,
              no recurring charge, and no circle access. Just the box, open to anyone whether or
              not you're on a paid plan.
            </p>
            <ul className="mt-5 space-y-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/goodie-box"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Get a Goodie Box — ₱799
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
