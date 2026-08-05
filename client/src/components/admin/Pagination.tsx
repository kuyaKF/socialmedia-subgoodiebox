import { Button } from '@/components/ui/button'

export function Pagination({
  page,
  totalPages,
  total,
  itemLabel,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  itemLabel: string
  onPageChange: (page: number) => void
}) {
  if (total === 0) return null

  return (
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {total} {itemLabel}
        {total === 1 ? '' : 's'} · page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
