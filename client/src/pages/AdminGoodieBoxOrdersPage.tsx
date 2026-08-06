import { useState } from 'react'
import { GoodieBoxOrdersTable } from '../components/admin/GoodieBoxOrdersTable'

export function AdminGoodieBoxOrdersPage() {
  const [refreshTick, setRefreshTick] = useState(0)

  function handleAdvanced() {
    setRefreshTick((t) => t + 1)
  }

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Goodie Box Orders</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <GoodieBoxOrdersTable
          title="Pending Delivery"
          deliveryStatus="pending_delivery"
          refreshTick={refreshTick}
          onAdvanced={handleAdvanced}
        />
        <GoodieBoxOrdersTable
          title="Delivery In Progress"
          deliveryStatus="in_progress"
          refreshTick={refreshTick}
          onAdvanced={handleAdvanced}
        />
        <div className="lg:col-span-2">
          <GoodieBoxOrdersTable
            title="Order Complete"
            deliveryStatus="complete"
            refreshTick={refreshTick}
            onAdvanced={handleAdvanced}
          />
        </div>
      </div>
    </div>
  )
}
