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
  pending_delivery: 'bg-[#E888A0]/20 text-[#2C4870]',
  in_progress: 'bg-[#7FB3CC]/25 text-[#2C4870]',
  complete: 'bg-[#8FAE86]/25 text-[#2C4870]',
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
      className={`font-body rounded-full px-2.5 py-1 text-xs font-medium ${DELIVERY_STATUS_CLASSES[status]}`}
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
    <div className="bg-[#FFFDF9]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="font-body text-3xl font-extrabold tracking-tight text-[#2C4870] sm:text-4xl">
              A little comfort, delivered to your door
            </h1>
            <p className="font-body mt-3 max-w-md text-[15px] leading-relaxed text-[#4B5A73]">
              The Haven Circle Goodie Box — a single, thoughtfully packed comfort package. No
              membership and no circle access included, just the box.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-body text-3xl font-bold text-[#2C4870]">
                {GOODIE_BOX_PRICE_LABEL}
              </span>
              <span className="font-body text-sm text-[#4B5A73]">one-time, ships once</span>
            </div>
            <span className="font-body mt-4 inline-block rounded-full bg-[#8FAE86]/20 px-3 py-1 text-xs font-semibold text-[#2C4870]">
              No subscription required
            </span>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] bg-[#2C4870] text-[#FFFDF9] shadow-xl sm:h-52 sm:w-52">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.75rem] bg-linear-to-br from-[#E888A0]/35 via-[#8FAE86]/25 to-[#7FB3CC]/35 blur-2xl"
              />
              <GiftIcon className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 pb-16 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-10">
          <section>
            <h2 className="font-body mb-4 text-lg font-bold text-[#2C4870]">What's inside</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {WHATS_INSIDE.map(({ icon: Icon, title, body }) => (
                <div key={title} className="stationery-card rounded-2xl p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#8FAE86]/20 text-[#2C4870]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-body text-sm font-bold text-[#2C4870]">{title}</p>
                  <p className="font-body mt-1 text-xs text-[#4B5A73]">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-body mb-4 text-lg font-bold text-[#2C4870]">How it works</h2>
            <ol className="space-y-4">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-body flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2C4870] text-xs font-bold text-[#FFFDF9]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-body text-sm font-bold text-[#2C4870]">{step.title}</p>
                    <p className="font-body text-sm text-[#4B5A73]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {isRegularUser && (
            <section>
              <h2 className="font-body mb-3 text-lg font-bold text-[#2C4870]">My orders</h2>
              {ordersLoading && <p className="font-body text-sm text-[#4B5A73]/70">Loading...</p>}
              {!ordersLoading && orders.length === 0 && (
                <p className="font-body text-sm text-[#4B5A73]/70">No orders yet.</p>
              )}
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="stationery-card flex items-center justify-between rounded-xl p-4"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-[#2C4870]">
                        Purchased {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="font-body flex items-center gap-1 text-xs text-[#4B5A73]">
                        <CheckIcon className="h-3 w-3 text-[#2C4870]" />
                        Payment confirmed
                      </p>
                    </div>
                    <DeliveryStatusPill status={order.deliveryStatus} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-body mb-3 text-lg font-bold text-[#2C4870]">Good to know</h2>
            <dl className="stationery-card divide-y divide-[#2C4870]/10 rounded-2xl">
              {GOOD_TO_KNOW.map((item) => (
                <div key={item.q} className="p-4">
                  <dt className="font-body text-sm font-bold text-[#2C4870]">{item.q}</dt>
                  <dd className="font-body mt-1 text-sm text-[#4B5A73]">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="stationery-card rounded-[1.75rem] p-5 sm:p-6">
            {checkoutState === 'success' && isRegularUser && (
              <div className="mb-4 rounded-2xl bg-[#8FAE86]/15 p-4 text-sm text-[#2C4870]">
                {confirming ? (
                  <p className="font-body">
                    Payment received — confirming your order, just a moment...
                  </p>
                ) : (
                  <p className="font-body">Payment confirmed! Your order is below.</p>
                )}
                <button
                  onClick={dismissCheckoutNotice}
                  className="font-body mt-1 text-xs text-[#4B5A73] underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            {checkoutState === 'cancelled' && isRegularUser && (
              <div className="mb-4 rounded-2xl bg-[#E888A0]/15 p-4 text-sm text-[#2C4870]">
                <p className="font-body">Checkout was cancelled — no payment was made.</p>
                <button
                  onClick={dismissCheckoutNotice}
                  className="font-body mt-1 text-xs text-[#4B5A73] underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!user && (
              <div className="text-center">
                <p className="font-body text-sm font-medium text-[#4B5A73]">Haven Circle Goodie Box</p>
                <p className="font-body mt-1 text-2xl font-bold text-[#2C4870]">
                  {GOODIE_BOX_PRICE_LABEL}
                </p>
                <p className="font-body mt-3 text-sm text-[#4B5A73]">
                  Log in or create an account to buy a Goodie Box.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    to="/login"
                    className="font-body rounded-full bg-[#2C4870] px-4 py-2 text-sm font-semibold text-[#FFFDF9] transition-transform hover:-translate-y-0.5"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="font-body rounded-full border border-[#2C4870]/20 px-4 py-2 text-sm font-medium text-[#2C4870] transition-colors hover:bg-[#2C4870]/5"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {user && !isRegularUser && (
              <div className="font-body text-center text-sm text-[#4B5A73]">
                As a staff or admin account, you don't need to purchase a Goodie Box.
              </div>
            )}

            {isRegularUser && (
              <>
                <p className="font-body text-sm font-medium text-[#4B5A73]">Haven Circle Goodie Box</p>
                <p className="font-body mt-1 text-2xl font-bold text-[#2C4870]">
                  {GOODIE_BOX_PRICE_LABEL}
                </p>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="font-body mb-1 block text-sm text-[#4B5A73]">Full name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="font-body w-full rounded-xl border border-[#2C4870]/15 bg-white px-3 py-2 text-[#2C4870] focus:border-[#2C4870]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-body mb-1 block text-sm text-[#4B5A73]">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="font-body w-full rounded-xl border border-[#2C4870]/15 bg-white px-3 py-2 text-[#2C4870] focus:border-[#2C4870]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-body mb-1 block text-sm text-[#4B5A73]">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="font-body w-full rounded-xl border border-[#2C4870]/15 bg-white px-3 py-2 text-[#2C4870] focus:border-[#2C4870]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-body mb-1 block text-sm text-[#4B5A73]">
                      Delivery notes (optional)
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={2}
                      className="font-body w-full rounded-xl border border-[#2C4870]/15 bg-white px-3 py-2 text-[#2C4870] focus:border-[#2C4870]/40 focus:outline-none"
                    />
                  </div>
                  {error && <p className="font-body text-sm text-[#B23A5C]">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="font-body w-full rounded-full bg-[#2C4870] px-4 py-2.5 text-sm font-semibold text-[#FFFDF9] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {submitting ? 'Redirecting...' : `Buy Goodie Box — ${GOODIE_BOX_PRICE_LABEL}`}
                  </button>
                </form>
                <p className="font-body mt-3 text-center text-xs text-[#4B5A73]/70">
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
