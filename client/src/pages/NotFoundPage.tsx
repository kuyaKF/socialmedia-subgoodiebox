import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto mt-24 max-w-md px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <Link to="/" className="text-slate-900 underline">
        Back to home
      </Link>
    </div>
  )
}
