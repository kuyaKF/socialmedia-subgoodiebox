import { useState } from 'react'
import { resendVerificationRequest } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!user || user.emailVerified) return null

  async function handleResend() {
    setStatus('sending')
    try {
      await resendVerificationRequest()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
      {status === 'sent' ? (
        <span>Verification email sent — check your inbox.</span>
      ) : (
        <>
          <span>Please verify your email address.</span>{' '}
          <button
            onClick={handleResend}
            disabled={status === 'sending'}
            className="font-medium underline disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Resend verification email'}
          </button>
          {status === 'error' && <span className="ml-2 text-red-600">Could not resend — try again.</span>}
        </>
      )}
    </div>
  )
}
