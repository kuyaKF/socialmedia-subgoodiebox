import { CheckIcon } from '../icons'

const REASONS = [
  "Skip the cold-start problem — you're placed in a circle with people from day one.",
  'A peer support lead who actually knows your circle is looking out for you.',
  'A private circle feed — not a public broadcast, just your people.',
  "Part of every membership helps fund a Goodie Box for someone who can't yet afford one.",
  'Upgrade, downgrade, or leave anytime — no contracts, no pressure.',
  'Built by a small team that listens and genuinely cares about getting this right.',
]

export function WhyJoin() {
  return (
    <section id="why-join" className="bg-wash-sage px-4 py-20">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="font-body text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
          Why people join
        </h2>
        <p className="font-body mt-4 text-[15px] leading-relaxed text-[#4B5A73]">
          It's not just another wellness app. Here's what actually makes members feel less alone.
        </p>
      </div>
      <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {REASONS.map((reason) => (
          <li
            key={reason}
            className="stationery-card flex items-start gap-3 rounded-2xl px-5 py-4"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8FAE86]/25 text-[#2C4870]">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span className="font-body text-sm text-[#4B5A73]">{reason}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
