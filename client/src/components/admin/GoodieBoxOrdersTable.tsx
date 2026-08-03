import { useEffect, useState } from 'react'
import { advanceGoodieBoxOrderRequest, listGoodieBoxOrdersRequest } from '../../api/adminGoodieBox.api'
import type { GoodieBoxDeliveryStatus, PaginatedGoodieBoxOrders } from '../../types/models'

const PAGE_SIZE = 10

const ADVANCE_LABEL: Partial<Record<GoodieBoxDeliveryStatus, string>> = {
  pending_delivery: 'Mark in progress',
  in_progress: 'Mark complete',
}

export function GoodieBoxOrdersTable({
  title,
  deliveryStatus,
  refreshTick,
  onAdvanced,
}: {
  title: string
  deliveryStatus: GoodieBoxDeliveryStatus
  refreshTick: number
  onAdvanced: () => void
}) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedGoodieBoxOrders | null>(null)
  const [loading, setLoading] = useState(true)
  const [advancingId, setAdvancingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listGoodieBoxOrdersRequest(deliveryStatus, page, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [deliveryStatus, page, refreshTick])

  async function handleAdvance(orderId: string) {
    setAdvancingId(orderId)
    try {
      await advanceGoodieBoxOrderRequest(orderId)
      onAdvanced()
    } finally {
      setAdvancingId(null)
    }
  }

  const advanceLabel = ADVANCE_LABEL[deliveryStatus]

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-slate-500">{title}</h2>
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Recipient</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Purchased</th>
              {advanceLabel && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.orders.map((order) => {
              const buyer = typeof order.user === 'object' ? order.user : null
              return (
                <tr key={order._id}>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {buyer ? buyer.name : '—'}
                    {buyer && <p className="text-xs font-normal text-slate-400">{buyer.email}</p>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{order.fullName}</td>
                  <td className="px-3 py-2 text-slate-600">{order.phone}</td>
                  <td className="max-w-xs px-3 py-2 text-slate-600">{order.address}</td>
                  <td className="max-w-xs px-3 py-2 text-slate-400">{order.deliveryNotes || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  {advanceLabel && (
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleAdvance(order._id)}
                        disabled={advancingId === order._id}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {advancingId === order._id ? 'Moving...' : advanceLabel}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
            {!loading && data?.orders.length === 0 && (
              <tr>
                <td colSpan={advanceLabel ? 7 : 6} className="px-3 py-6 text-center text-slate-500">
                  No orders here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            {data.total} order{data.total === 1 ? '' : 's'} · page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.page <= 1}
              className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={data.page >= data.totalPages}
              className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
