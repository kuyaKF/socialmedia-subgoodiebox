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
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
      <div className="mx-auto mb-4 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Membership gets you into the circle
        </h2>
        <p className="mt-4 text-slate-600">
          A subscription is what places you in a private support circle with a peer lead looking
          out for you. Pick the level of support that fits — change your mind whenever.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.highlighted
                ? 'relative flex flex-col rounded-2xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-xl sm:-my-4 sm:py-10'
                : 'flex flex-col rounded-2xl border border-slate-200 bg-white p-6'
            }
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">
                Best value
              </span>
            )}
            <h3 className={`text-lg font-semibold ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
              {tier.name}
            </h3>
            <p className={`mt-1 text-sm ${tier.highlighted ? 'text-slate-300' : 'text-slate-500'}`}>
              {tier.tagline}
            </p>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{tier.price}</span>
              <span className={tier.highlighted ? 'text-slate-300' : 'text-slate-500'}>/mo</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckIcon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlighted ? 'text-amber-400' : 'text-emerald-600'}`}
                  />
                  <span className={tier.highlighted ? 'text-slate-200' : 'text-slate-600'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={ctaTo}
              className={
                tier.highlighted
                  ? 'mt-8 block rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-slate-100'
                  : 'mt-8 block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50'
              }
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        Paid via PayMongo (currently in test mode) — 30 days per payment, cancel anytime from your
        subscription page. Part of every membership helps fund a Goodie Box for a member who
        can't yet afford one. Want a comfort box for yourself instead? Get a one-time{' '}
        <Link to="/goodie-box" className="underline hover:text-slate-500">
          Goodie Box
        </Link>{' '}
        — no subscription needed.
      </p>
    </section>
  )
}
