import { Link } from 'react-router-dom'
import { CheckIcon, GiftIcon } from '../icons'

const FEATURES = ['Curated comfort items', 'A handwritten note', 'One-time purchase, ships once']

export function GoodieBoxTeaser() {
  return (
    <section id="goodie-box" className="bg-wash-blush px-4 py-20">
      <div className="stationery-card mx-auto flex max-w-xl flex-col items-center gap-6 rounded-[1.75rem] p-8 text-center sm:p-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E888A0]/25 text-[#2C4870]">
          <GiftIcon className="h-8 w-8" />
        </div>
        <div>
          <p className="font-body text-xs font-semibold tracking-widest text-[#4B5A73] uppercase">
            No subscription required
          </p>
          <h2 className="font-body mt-1.5 text-2xl font-extrabold tracking-tight text-[#2C4870] sm:text-3xl">
            Not ready to join a circle? Try a Goodie Box first.
          </h2>
          <p className="font-body mt-3 text-[15px] leading-relaxed text-[#4B5A73]">
            A one-time comfort package, ₱799, delivered straight to your door — no membership, no
            recurring charge, and no circle access. Just the box, open to anyone whether or not
            you're on a paid plan.
          </p>
        </div>
        <ul className="mx-auto inline-flex flex-col items-start gap-2 text-left">
          {FEATURES.map((feature) => (
            <li key={feature} className="font-body flex items-center gap-2 text-sm text-[#4B5A73]">
              <CheckIcon className="h-4 w-4 shrink-0 text-[#2C4870]" />
              {feature}
            </li>
          ))}
        </ul>
        <Link
          to="/goodie-box"
          className="font-body inline-block rounded-full bg-[#2C4870] px-6 py-2.5 text-sm font-semibold text-[#FFFDF9] transition-transform hover:-translate-y-0.5"
        >
          Get a Goodie Box — ₱799
        </Link>
      </div>
    </section>
  )
}
