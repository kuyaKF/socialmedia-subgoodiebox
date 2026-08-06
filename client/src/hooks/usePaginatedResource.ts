import { useEffect, useState } from 'react'

// Dedupes the debounced-search + pagination + cancel-guard pattern that was
// previously copy-pasted in UsersBrowser and GroupsBrowser. `fetcher` should be a
// closure over whatever filters/sort the caller cares about; `deps` lists the
// values (besides `page`) that should trigger a refetch, e.g. filter/sort state
// and a refresh-tick counter.
export function usePaginatedResource<TResult>(
  fetcher: (page: number) => Promise<TResult>,
  deps: unknown[],
  debounceMs = 300,
) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<TResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      fetcher(page)
        .then((result) => {
          if (!cancelled) setData(result)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, debounceMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...deps])

  return { page, setPage, data, loading }
}
