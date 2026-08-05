import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePaginatedResource } from '@/hooks/usePaginatedResource'
import { advanceGoodieBoxOrderRequest, listGoodieBoxOrdersRequest } from '../../api/adminGoodieBox.api'
import type { GoodieBoxDeliveryStatus } from '../../types/models'
import { StatusBadge } from '../StatusBadge'
import { DELIVERY_STATUS_BADGE_COLOR } from './chartColors'
import { Pagination } from './Pagination'

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
  const [advancingId, setAdvancingId] = useState<string | null>(null)

  const { page, setPage, data, loading } = usePaginatedResource(
    (page) => listGoodieBoxOrdersRequest(deliveryStatus, page, PAGE_SIZE),
    [deliveryStatus, refreshTick],
  )

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
    <div>
      <h2 className="mb-3">
        <StatusBadge label={title} color={DELIVERY_STATUS_BADGE_COLOR[deliveryStatus]} />
      </h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Purchased</TableHead>
              {advanceLabel && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.orders.map((order) => {
              const buyer = typeof order.user === 'object' ? order.user : null
              return (
                <TableRow key={order._id}>
                  <TableCell className="font-medium text-foreground">
                    {buyer ? buyer.name : '—'}
                    {buyer && (
                      <p className="text-xs font-normal text-muted-foreground">{buyer.email}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{order.phone}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {order.address}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {order.deliveryNotes || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  {advanceLabel && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdvance(order._id)}
                        disabled={advancingId === order._id}
                      >
                        {advancingId === order._id ? 'Moving...' : advanceLabel}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
            {!loading && data?.orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={advanceLabel ? 7 : 6}
                  className="py-6 text-center text-muted-foreground"
                >
                  No orders here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          itemLabel="order"
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
