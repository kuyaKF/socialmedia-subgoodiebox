import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createGoodieBoxCheckoutRequest, listMyGoodieBoxOrdersRequest } from '../api/goodieBox.api'
import { CheckIcon, GiftIcon, PencilIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import type { GoodieBoxDeliveryStatus, GoodieBoxOrder } from '../types/models'
import { extractErrorMessage } from '../utils/errors'

const GOODIE_BOX_PRICE_LABEL = '₱799.00'

const DELIVERY_STATUS_LABELS: Record<GoodieBoxDeliveryStatus, string> = {
  pending_delivery: 'Pending delivery',
  in_progress: 'Delivery in progress',
  complete: 'Delivered',
}

const DELIVERY_STATUS_CLASSES: Record<GoodieBoxDeliveryStatus, string> = {
  pending_delivery: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-sky-100 text-sky-700',
  complete: 'bg-emerald-100 text-emerald-700',
}

const WHATS_INSIDE = [
  {
    icon: GiftIcon,
    title: 'Curated comfort items',
    body: 'A small selection of comfort goods, picked for the season.',
  },
  {
    icon: PencilIcon,
    title: 'A handwritten note',
    body: 'A short note tucked inside every box — a small hello from the team.',
  },
  {
    icon: CheckIcon,
    title: 'One-time, ships once',
    body: 'No subscription and no recurring charge — just this one box.',
  },
]

const HOW_IT_WORKS = [
  {
    title: 'Add your delivery details',
    body: 'Tell us where to send it — full name, phone, and address.',
  },
  {
    title: 'Pay securely via PayMongo',
    body: "You're redirected to a secure checkout page. We never see or store your card details.",
  },
  {
    title: 'We pack & ship',
    body: "Your box gets packed and shipped, then tracked right here until it's delivered.",
  },
]

const GOOD_TO_KNOW = [
  {
    q: 'Do I need a subscription?',
    a: 'No. This is a standalone one-time purchase — it does not include a membership or circle access.',
  },
  {
    q: 'Can I order more than one?',
    a: 'Each purchase ships one box. You can buy again anytime for another.',
  },
  {
    q: 'How do I track delivery?',
    a: "Your order status — pending, in progress, or delivered — shows under \"My orders\" once payment is confirmed.",
  },
]

function DeliveryStatusPill({ status }: { status: GoodieBoxDeliveryStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${DELIVERY_STATUS_CLASSES[status]}`}
    >
      {DELIVERY_STATUS_LABELS[status]}
    </span>
  )
}

export function GoodieBoxPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const checkoutState = searchParams.get('checkout')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [orders, setOrders] = useState<GoodieBoxOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isRegularUser = user?.role === 'user'

  useEffect(() => {
    if (!user) return
    setFullName(user.name)
  }, [user])

  useEffect(() => {
    if (!isRegularUser) return
    setOrdersLoading(true)
    listMyGoodieBoxOrdersRequest()
      .then(setOrders)
      .finally(() => setOrdersLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegularUser])

  useEffect(() => {
    if (checkoutState !== 'success' || !isRegularUser) return

    const initialCount = orders.length
    setConfirming(true)
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts += 1
      const latest = await listMyGoodieBoxOrdersRequest()
      setOrders(latest)
      if (latest.length > initialCount || attempts >= 8) {
        if (pollRef.current) clearInterval(pollRef.current)
        setConfirming(false)
      }
    }, 2000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutState, isRegularUser])

  function dismissCheckoutNotice() {
    searchParams.delete('checkout')
    setSearchParams(searchParams, { replace: true })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Full name, phone, and address are required')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const checkoutUrl = await createGoodieBoxCheckoutRequest({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
      })
      window.location.href = checkoutUrl
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not start checkout'))
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                One-time purchase · No subscription required
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A little comfort, delivered to your door
              </h1>
              <p className="mt-3 max-w-md text-slate-600">
                The Haven Circle Goodie Box — a single, thoughtfully packed comfort package. No
                membership and no circle access included, just the box.
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{GOODIE_BOX_PRICE_LABEL}</span>
                <span className="text-sm text-slate-500">one-time, ships once</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-xl sm:h-52 sm:w-52">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-400/30 via-fuchsia-400/20 to-amber-300/30 blur-2xl"
                />
                <GiftIcon className="h-16 w-16 sm:h-20 sm:w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 pb-16 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">What's inside</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {WHATS_INSIDE.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">How it works</h2>
            <ol className="space-y-4">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-500">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {isRegularUser && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">My orders</h2>
              {ordersLoading && <p className="text-sm text-slate-400">Loading...</p>}
              {!ordersLoading && orders.length === 0 && (
                <p className="text-sm text-slate-400">No orders yet.</p>
              )}
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Purchased {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-emerald-600">Payment confirmed</p>
                    </div>
                    <DeliveryStatusPill status={order.deliveryStatus} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Good to know</h2>
            <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200">
              {GOOD_TO_KNOW.map((item) => (
                <div key={item.q} className="p-4">
                  <dt className="text-sm font-medium text-slate-900">{item.q}</dt>
                  <dd className="mt-1 text-sm text-slate-500">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
            {checkoutState === 'success' && isRegularUser && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                {confirming ? (
                  <p>Payment received — confirming your order, just a moment...</p>
                ) : (
                  <p>Payment confirmed! Your order is below.</p>
                )}
                <button onClick={dismissCheckoutNotice} className="mt-1 text-xs underline">
                  Dismiss
                </button>
              </div>
            )}
            {checkoutState === 'cancelled' && isRegularUser && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p>Checkout was cancelled — no payment was made.</p>
                <button onClick={dismissCheckoutNotice} className="mt-1 text-xs underline">
                  Dismiss
                </button>
              </div>
            )}

            {!user && (
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">Haven Circle Goodie Box</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{GOODIE_BOX_PRICE_LABEL}</p>
                <p className="mt-3 text-sm text-slate-600">
                  Log in or create an account to buy a Goodie Box.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {user && !isRegularUser && (
              <div className="text-center text-sm text-slate-600">
                As a staff or admin account, you don't need to purchase a Goodie Box.
              </div>
            )}

            {isRegularUser && (
              <>
                <p className="text-sm font-medium text-slate-500">Haven Circle Goodie Box</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{GOODIE_BOX_PRICE_LABEL}</p>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Full name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-600">
                      Delivery notes (optional)
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {submitting ? 'Redirecting...' : `Buy Goodie Box — ${GOODIE_BOX_PRICE_LABEL}`}
                  </button>
                </form>
                <p className="mt-3 text-center text-xs text-slate-400">
                  Secured checkout via PayMongo — test mode, no real charges yet.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
