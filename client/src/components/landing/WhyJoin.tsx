import { CheckIcon } from '../icons'

const REASONS = [
  "Skip the cold-start problem — you're placed in a circle with people from day one.",
  'A peer support lead who actually knows your circle is looking out for you.',
  'A monthly care package that turns a hard month into something to look forward to.',
  "Part of every membership helps fund a care package for someone who can't yet afford one.",
  'Upgrade, downgrade, or leave anytime — no contracts, no pressure.',
  'Built by a small team that listens and genuinely cares about getting this right.',
]

export function WhyJoin() {
  return (
    <section id="why-join" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why people join
          </h2>
          <p className="mt-4 text-slate-600">
            It's not just another wellness app. Here's what actually makes members feel less
            alone.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <li key={reason} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span className="text-sm text-slate-700">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
