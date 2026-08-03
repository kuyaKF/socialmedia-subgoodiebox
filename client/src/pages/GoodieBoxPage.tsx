import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createGoodieBoxCheckoutRequest, listMyGoodieBoxOrdersRequest } from '../api/goodieBox.api'
import { CheckIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import type { GoodieBoxDeliveryStatus, GoodieBoxOrder } from '../types/models'

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

function DeliveryStatusPill({ status }: { status: GoodieBoxDeliveryStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${DELIVERY_STATUS_CLASSES[status]}`}
    >
      {DELIVERY_STATUS_LABELS[status]}
    </span>
  )
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
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
    <div className="mx-auto mt-10 max-w-2xl px-4 pb-16">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Haven Circle Goodie Box</h1>
      <p className="mb-6 text-sm text-slate-500">
        A one-time care package, delivered straight to your door — available to any member,
        regardless of your circle plan.
      </p>

      <div className="mb-8 rounded-xl border border-slate-200 p-5">
        <p className="text-2xl font-bold text-slate-900">{GOODIE_BOX_PRICE_LABEL}</p>
        <ul className="mt-4 space-y-2">
          {['Curated comfort items', 'A handwritten note', 'One-time purchase, ships once'].map(
            (feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {feature}
              </li>
            )
          )}
        </ul>
      </div>

      {!user && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="mb-3 text-sm text-slate-600">Log in or create an account to buy a Goodie Box.</p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {user && !isRegularUser && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600">
          As a staff or admin account, you don't need to purchase a Goodie Box.
        </div>
      )}

      {isRegularUser && (
        <>
          {checkoutState === 'success' && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
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
          {checkoutState === 'cancelled' && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p>Checkout was cancelled — no payment was made.</p>
              <button onClick={dismissCheckoutNotice} className="mt-1 text-xs underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-3 text-sm font-medium text-slate-500">My orders</h2>
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 p-5">
            <h2 className="mb-1 text-sm font-medium text-slate-900">Delivery details</h2>
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
              <label className="mb-1 block text-sm text-slate-600">Delivery notes (optional)</label>
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
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {submitting ? 'Redirecting...' : `Buy Goodie Box — ${GOODIE_BOX_PRICE_LABEL}`}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
