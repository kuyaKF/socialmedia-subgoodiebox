import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createCheckoutRequest } from '../api/payments.api'
import { cancelMySubscriptionRequest } from '../api/subscription.api'
import { CheckIcon } from '../components/icons'
import { PAID_PLAN_IDS, PLAN_LABELS, PLAN_PRICE_LABELS } from '../config/plans'
import { useAuth } from '../context/AuthContext'
import type { PaidSubscriptionPlan } from '../types/models'

const PLAN_FEATURES: Record<PaidSubscriptionPlan, string[]> = {
  starter: ['Full profile & circle membership', 'Community feed access', 'Like & comment on posts'],
  plus: ['Everything in Starter', 'Priority circle placement', 'Early access to new resources'],
  premium: ['Everything in Plus', 'Direct line to your peer support lead', 'Exclusive member-only resources'],
}

const PLANS: {
  id: PaidSubscriptionPlan
  label: string
  priceLabel: string
  features: string[]
}[] = PAID_PLAN_IDS.map((id) => ({
  id,
  label: PLAN_LABELS[id],
  priceLabel: `${PLAN_PRICE_LABELS[id]}/mo`,
  features: PLAN_FEATURES[id],
}))

export function SubscriptionPage() {
  const { user, refreshMe } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [checkoutLoading, setCheckoutLoading] = useState<PaidSubscriptionPlan | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkoutState = searchParams.get('checkout')

  useEffect(() => {
    if (checkoutState !== 'success') return

    setConfirming(true)
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts += 1
      await refreshMe()
      if (attempts >= 8) {
        if (pollRef.current) clearInterval(pollRef.current)
        setConfirming(false)
      }
    }, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutState])

  // Stop polling early once the plan actually changes to a paid one.
  useEffect(() => {
    if (confirming && user && user.subscription.plan !== 'free') {
      if (pollRef.current) clearInterval(pollRef.current)
      setConfirming(false)
    }
  }, [confirming, user])

  if (!user) return null

  async function handleChoosePlan(plan: PaidSubscriptionPlan) {
    setError(null)
    setCheckoutLoading(plan)
    try {
      const checkoutUrl = await createCheckoutRequest(plan)
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not start checkout'
      setError(message)
      setCheckoutLoading(null)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    try {
      await cancelMySubscriptionRequest()
      await refreshMe()
    } finally {
      setCancelling(false)
    }
  }

  function dismissCheckoutNotice() {
    searchParams.delete('checkout')
    setSearchParams(searchParams, { replace: true })
  }

  const { plan, status, currentPeriodEnd } = user.subscription
  const isPaid = plan !== 'free'

  return (
    <div className="mx-auto mt-10 max-w-3xl px-4">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">My Membership</h1>
      <p className="mb-6 text-sm text-slate-500">
        Payments are processed securely by PayMongo, currently in test mode — no real charges yet.
      </p>

      {checkoutState === 'success' && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {confirming ? (
            <p>Payment received — confirming and activating your plan, just a moment...</p>
          ) : (
            <p>Your plan is up to date below.</p>
          )}
          <button onClick={dismissCheckoutNotice} className="mt-1 text-xs underline">
            Dismiss
          </button>
        </div>
      )}
      {checkoutState === 'cancelled' && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>Checkout was cancelled — no payment was made.</p>
          <button onClick={dismissCheckoutNotice} className="mt-1 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-8 rounded-lg border border-slate-200 p-4">
        <p className="text-lg font-semibold capitalize text-slate-900">{plan} plan</p>
        <p className="text-sm capitalize text-slate-500">{status}</p>
        {isPaid && currentPeriodEnd && (
          <p className="mt-1 text-sm text-slate-500">
            Renews or expires on {new Date(currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        {isPaid && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-3 text-sm text-red-600 underline disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel subscription'}
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((tier) => {
          const isCurrent = plan === tier.id
          return (
            <div
              key={tier.id}
              className={`flex flex-col rounded-xl border p-5 ${
                isCurrent ? 'border-slate-900' : 'border-slate-200'
              }`}
            >
              <h3 className="font-semibold text-slate-900">{tier.label}</h3>
              <p className="mt-1 text-2xl font-bold text-slate-900">{tier.priceLabel}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoosePlan(tier.id)}
                disabled={isCurrent || checkoutLoading !== null}
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {isCurrent
                  ? 'Current plan'
                  : checkoutLoading === tier.id
                    ? 'Redirecting...'
                    : `Choose ${tier.label}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
