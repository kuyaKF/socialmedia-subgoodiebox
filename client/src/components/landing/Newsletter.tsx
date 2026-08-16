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
    <section className="bg-[#2C4870] px-4 py-16">
      <div className="stationery-card mx-auto max-w-lg rounded-[1.75rem] px-8 py-9 text-center">
        <h2 className="font-body text-2xl font-extrabold text-[#2C4870]">Stay connected</h2>
        <p className="font-body mt-3 text-sm leading-relaxed text-[#4B5A73]">
          Get gentle updates on new Goodie Box themes, mental health resources, and community
          news. No spam, ever.
        </p>
        {status === 'done' ? (
          <p className="font-body mt-6 text-sm font-semibold text-[#2C4870]">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-sm gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="font-body w-full rounded-full border border-[#2C4870]/20 bg-white px-4 py-2.5 text-sm text-[#2C4870] placeholder-[#4B5A73] focus:border-[#2C4870] focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="font-body shrink-0 rounded-full bg-[#2C4870] px-5 py-2.5 text-sm font-semibold text-[#FFFDF9] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="font-body mt-3 text-sm text-[#B23A5C]">{message}</p>}
      </div>
    </section>
  )
}
