import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePaginatedResource } from '@/hooks/usePaginatedResource'
import { listUsersRequest } from '../../api/users.api'
import type { Group, GroupRef, SortOrder, SubscriptionPlan, UserSortField } from '../../types/models'
import { RoleBadge } from '../RoleBadge'
import { Pagination } from './Pagination'
import { RegisterStaffModal } from './RegisterStaffModal'

const PAGE_SIZE = 10

const SELECT_CLASS =
  'h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

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
  const [sort, setSort] = useState<{ field: UserSortField; order: SortOrder }>({
    field: 'createdAt',
    order: 'desc',
  })
  const [refreshTick, setRefreshTick] = useState(0)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const { page, setPage, data, loading } = usePaginatedResource(
    (page) =>
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
      }),
    [JSON.stringify(filters), sort.field, sort.order, refreshTick],
  )

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
        <Button type="button" size="sm" onClick={() => setShowRegisterModal(true)}>
          <PlusIcon />
          Register staff
        </Button>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search name or email..."
          className="lg:col-span-2"
        />
        <select
          value={filters.plan}
          onChange={(e) => updateFilter('plan', e.target.value as Filters['plan'])}
          className={SELECT_CLASS}
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
          className={SELECT_CLASS}
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
          <Input
            type="date"
            value={filters.registeredFrom}
            onChange={(e) => updateFilter('registeredFrom', e.target.value)}
            aria-label="Registered from"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="date"
            value={filters.registeredTo}
            onChange={(e) => updateFilter('registeredTo', e.target.value)}
            aria-label="Registered to"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setPage(1)
            setFilters(EMPTY_FILTERS)
          }}
          className="mb-3 text-xs text-muted-foreground underline"
        >
          Clear filters
        </button>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map(({ field, label }) => {
                const isActive = sort.field === field
                return (
                  <TableHead key={field}>
                    <button
                      type="button"
                      onClick={() => handleSort(field)}
                      className={`flex items-center gap-1 hover:text-foreground ${
                        isActive ? 'text-foreground' : ''
                      }`}
                    >
                      {label}
                      <ChevronDownIcon
                        className={`h-3 w-3 transition-transform ${
                          isActive ? (sort.order === 'asc' ? 'rotate-180' : '') : 'opacity-30'
                        }`}
                      />
                    </button>
                  </TableHead>
                )
              })}
              <TableHead>Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((u) => {
              const group = typeof u.group === 'object' ? (u.group as GroupRef | null) : null
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link to={`/profile/${u.id}`} className="hover:underline">
                      {u.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {u.subscription.plan}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group ? group.name : '—'}
                  </TableCell>
                </TableRow>
              )
            })}
            {!loading && data?.users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                  No users match these filters.
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
          itemLabel="user"
          onPageChange={setPage}
        />
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
