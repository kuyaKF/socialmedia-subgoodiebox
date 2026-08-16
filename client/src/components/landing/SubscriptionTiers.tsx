import { Link } from 'react-router-dom'
import { PAID_PLAN_IDS, PLAN_LABELS, PLAN_PRICE_LABELS } from '../../config/plans'
import { useAuth } from '../../context/AuthContext'
import type { PaidSubscriptionPlan } from '../../types/models'
import { CheckIcon } from '../icons'

interface Tier {
  name: string
  price: string
  tagline: string
  features: string[]
  highlighted?: boolean
}

const TIER_DETAILS: Record<PaidSubscriptionPlan, Pick<Tier, 'tagline' | 'features' | 'highlighted'>> = {
  starter: {
    tagline: 'Dip a toe in — circle access and community support.',
    features: [
      'Full profile & circle membership',
      'Community feed access',
      'Like & comment on posts',
      'Cancel anytime',
    ],
  },
  plus: {
    tagline: 'The one most members land on.',
    features: [
      'Everything in Starter',
      'Priority circle placement',
      'Early access to new resources',
      'Cancel anytime',
    ],
    highlighted: true,
  },
  premium: {
    tagline: 'For members who want deeper, ongoing support.',
    features: [
      'Everything in Plus',
      'Direct line to your peer support lead',
      'Exclusive member-only resources',
      'Cancel anytime',
    ],
  },
}

const TIERS: Tier[] = PAID_PLAN_IDS.map((id) => ({
  name: PLAN_LABELS[id],
  price: PLAN_PRICE_LABELS[id],
  ...TIER_DETAILS[id],
}))

export function SubscriptionTiers() {
  const { user } = useAuth()
  const ctaTo = user ? '/subscription' : '/register'

  return (
    <section id="pricing" className="bg-[#FFFDF9] px-4 py-20">
      <div className="mx-auto mb-4 max-w-2xl text-center">
        <h2 className="font-body text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
          Membership gets you into the circle
        </h2>
        <p className="font-body mt-4 text-[15px] leading-relaxed text-[#4B5A73]">
          A subscription is what places you in a private support circle with a peer lead looking
          out for you. Pick the level of support that fits — change your mind whenever.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 pt-3 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.highlighted
                ? 'relative flex flex-col rounded-2xl bg-[#2C4870] p-6 text-[#FFFDF9] shadow-[0_16px_32px_rgba(44,72,112,0.3)] sm:-my-3 sm:py-9'
                : 'stationery-card flex flex-col rounded-2xl p-6'
            }
          >
            {tier.highlighted && (
              <span className="font-body absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E888A0] px-3 py-1 text-xs font-bold text-[#2C4870] shadow-sm">
                Most picked
              </span>
            )}
            <h3
              className={`font-body text-lg font-bold ${tier.highlighted ? 'text-[#FFFDF9]' : 'text-[#2C4870]'}`}
            >
              {tier.name}
            </h3>
            <p className={`font-body mt-1 text-sm ${tier.highlighted ? 'text-[#FFFDF9]/75' : 'text-[#4B5A73]'}`}>
              {tier.tagline}
            </p>
            <p className="font-body mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold">{tier.price}</span>
              <span className={tier.highlighted ? 'text-[#FFFDF9]/75' : 'text-[#4B5A73]'}>/mo</span>
            </p>
            <ul className="font-body mt-6 flex-1 space-y-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckIcon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlighted ? 'text-[#E888A0]' : 'text-[#2C4870]'}`}
                  />
                  <span className={tier.highlighted ? 'text-[#FFFDF9]/90' : 'text-[#4B5A73]'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={ctaTo}
              className={
                tier.highlighted
                  ? 'font-body mt-8 block rounded-full bg-[#FFFDF9] px-4 py-2.5 text-center text-sm font-semibold text-[#2C4870] transition-transform hover:-translate-y-0.5'
                  : 'font-body mt-8 block rounded-full bg-[#2C4870] px-4 py-2.5 text-center text-sm font-semibold text-[#FFFDF9] transition-transform hover:-translate-y-0.5'
              }
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
      <p className="font-body mx-auto mt-10 max-w-2xl text-center text-xs text-[#4B5A73]">
        Paid via PayMongo (currently in test mode) — 30 days per payment, cancel anytime from your
        subscription page. Part of every membership helps fund a Goodie Box for a member who can't
        yet afford one. Want a comfort box for yourself instead? Get a one-time{' '}
        <Link to="/goodie-box" className="underline hover:text-[#2C4870]">
          Goodie Box
        </Link>{' '}
        — no subscription needed.
      </p>
    </section>
  )
}
