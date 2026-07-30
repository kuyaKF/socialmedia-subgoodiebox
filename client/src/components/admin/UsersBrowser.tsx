import { useEffect, useState } from 'react'
import { listUsersRequest } from '../../api/users.api'
import type {
  Group,
  GroupRef,
  PaginatedUsers,
  SortOrder,
  SubscriptionPlan,
  UserSortField,
} from '../../types/models'
import { ChevronDownIcon, PlusIcon } from '../icons'
import { RoleBadge } from '../RoleBadge'
import { RegisterStaffModal } from './RegisterStaffModal'

const PAGE_SIZE = 10

const COLUMNS: { field: UserSortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'email', label: 'Email' },
  { field: 'createdAt', label: 'Registered' },
  { field: 'role', label: 'Role' },
  { field: 'plan', label: 'Subscription' },
]

interface Filters {
  search: string
  plan: '' | SubscriptionPlan
  group: string // '' = any, 'unassigned', or a groupId
  registeredFrom: string
  registeredTo: string
}

const EMPTY_FILTERS: Filters = {
  search: '',
  plan: '',
  group: '',
  registeredFrom: '',
  registeredTo: '',
}

export function UsersBrowser({
  groups,
  onUserChanged,
}: {
  groups: Group[]
  onUserChanged?: () => void
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ field: UserSortField; order: SortOrder }>({
    field: 'createdAt',
    order: 'desc',
  })
  const [data, setData] = useState<PaginatedUsers | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTick, setRefreshTick] = useState(0)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      listUsersRequest({
        search: filters.search || undefined,
        plan: filters.plan || undefined,
        group: filters.group || undefined,
        registeredFrom: filters.registeredFrom || undefined,
        registeredTo: filters.registeredTo || undefined,
        page,
        limit: PAGE_SIZE,
        sortBy: sort.field,
        sortOrder: sort.order,
      })
        .then((result) => {
          if (!cancelled) setData(result)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters, page, sort, refreshTick])

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleSort(field: UserSortField) {
    setPage(1)
    setSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { field, order: 'asc' },
    )
  }

  function handleStaffCreated() {
    setRefreshTick((t) => t + 1)
    onUserChanged?.()
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Register staff
        </button>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search name or email..."
          className="rounded border border-slate-300 px-2 py-1.5 text-sm lg:col-span-2"
        />
        <select
          value={filters.plan}
          onChange={(e) => updateFilter('plan', e.target.value as Filters['plan'])}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Any plan</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
        </select>
        <select
          value={filters.group}
          onChange={(e) => updateFilter('group', e.target.value)}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Any group</option>
          <option value="unassigned">Unassigned</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={filters.registeredFrom}
            onChange={(e) => updateFilter('registeredFrom', e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            aria-label="Registered from"
          />
          <span className="text-slate-400">–</span>
          <input
            type="date"
            value={filters.registeredTo}
            onChange={(e) => updateFilter('registeredTo', e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            aria-label="Registered to"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => {
            setPage(1)
            setFilters(EMPTY_FILTERS)
          }}
          className="mb-3 text-xs text-slate-500 underline"
        >
          Clear filters
        </button>
      )}

      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {COLUMNS.map(({ field, label }) => {
                const isActive = sort.field === field
                return (
                  <th key={field} className="px-3 py-2">
                    <button
                      onClick={() => handleSort(field)}
                      className={`flex items-center gap-1 hover:text-slate-700 ${
                        isActive ? 'text-slate-700' : ''
                      }`}
                    >
                      {label}
                      <ChevronDownIcon
                        className={`h-3 w-3 transition-transform ${
                          isActive ? (sort.order === 'asc' ? 'rotate-180' : '') : 'opacity-30'
                        }`}
                      />
                    </button>
                  </th>
                )
              })}
              <th className="px-3 py-2">Group</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.users.map((u) => {
              const group = typeof u.group === 'object' ? (u.group as GroupRef | null) : null
              return (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">{u.name}</td>
                  <td className="px-3 py-2 text-slate-600">{u.email}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-3 py-2 capitalize text-slate-600">{u.subscription.plan}</td>
                  <td className="px-3 py-2 text-slate-600">{group ? group.name : '—'}</td>
                </tr>
              )
            })}
            {!loading && data?.users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            {data.total} user{data.total === 1 ? '' : 's'} · page {data.page} of {data.totalPages}
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

      {showRegisterModal && (
        <RegisterStaffModal
          onClose={() => setShowRegisterModal(false)}
          onCreated={handleStaffCreated}
        />
      )}
    </div>
  )
}
