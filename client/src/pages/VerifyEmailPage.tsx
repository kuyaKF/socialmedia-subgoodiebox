import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmailRequest } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { refreshMe } = useAuth()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const requestedRef = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token.')
      return
    }

    // Guard against React StrictMode's double effect-invocation in dev — the token is
    // single-use server-side, so a second call would spuriously report failure.
    if (requestedRef.current) return
    requestedRef.current = true

    verifyEmailRequest(token)
      .then(async () => {
        setStatus('success')
        await refreshMe()
      })
      .catch((err: unknown) => {
        const errMessage =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'This verification link is invalid or has expired.'
        setStatus('error')
        setMessage(errMessage)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto mt-16 max-w-md px-4 text-center">
      {status === 'verifying' && <p className="text-slate-500">Verifying your email...</p>}
      {status === 'success' && (
        <>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">Email verified</h1>
          <p className="mb-6 text-slate-600">Thanks — your email address is confirmed.</p>
          <Link to="/feed" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
            Continue
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">Verification failed</h1>
          <p className="mb-6 text-slate-600">{message}</p>
          <Link to="/feed" className="text-sm text-slate-600 underline">
            Go to your feed
          </Link>
        </>
      )}
    </div>
  )
}
