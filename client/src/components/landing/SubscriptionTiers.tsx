import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CheckIcon } from '../icons'

interface Tier {
  name: string
  price: string
  tagline: string
  features: string[]
  highlighted?: boolean
}

// Must match server/src/config/plans.ts and client/src/pages/SubscriptionPage.tsx — no public
// pricing endpoint yet, so these are kept in sync by hand.
const TIERS: Tier[] = [
  {
    name: 'Starter',
    price: '₱499',
    tagline: 'Dip a toe in — circle access plus a seasonal care box.',
    features: [
      'Full profile & circle membership',
      'Community access',
      'Seasonal care package (quarterly)',
      'Cancel anytime',
    ],
  },
  {
    name: 'Plus',
    price: '₱999',
    tagline: 'The one most members land on.',
    features: [
      'Everything in Starter',
      'Full care package every month',
      'Priority circle placement',
      'Early access to new resources',
      'Cancel anytime',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '₱1,999',
    tagline: 'For members who want deeper, ongoing support.',
    features: [
      'Everything in Plus',
      'Premium, higher-value care package',
      'Direct line to your peer support lead',
      'Exclusive member-only resources',
      'Cancel anytime',
    ],
  },
]

export function SubscriptionTiers() {
  const { user } = useAuth()
  const ctaTo = user ? '/subscription' : '/register'

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
      <div className="mx-auto mb-4 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Membership &amp; your monthly care package
        </h2>
        <p className="mt-4 text-slate-600">
          Every plan includes full access to the community. The difference is what shows up in
          your mailbox — and how often. Pick what feels right, change your mind whenever.
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
        subscription page. Part of every membership helps fund a care package for a member who
        can't yet afford one.
      </p>
    </section>
  )
}
