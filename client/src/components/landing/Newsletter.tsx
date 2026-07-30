import { useState, type FormEvent } from 'react'
import { subscribeToNewsletterRequest } from '../../api/newsletter.api'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const result = await subscribeToNewsletterRequest(email)
      setMessage(result)
      setStatus('done')
      setEmail('')
    } catch (err: unknown) {
      const errMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong — try again.'
      setMessage(errMessage)
      setStatus('error')
    }
  }

  return (
    <section className="bg-slate-900 py-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Stay connected</h2>
        <p className="mt-3 text-slate-300">
          Get gentle updates on new care package themes, mental health resources, and community
          news. No spam, ever.
        </p>
        {status === 'done' ? (
          <p className="mt-6 text-sm font-medium text-emerald-400">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-white/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="mt-3 text-sm text-red-400">{message}</p>}
      </div>
    </section>
  )
}
