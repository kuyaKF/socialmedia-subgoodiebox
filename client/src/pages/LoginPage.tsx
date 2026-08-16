import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeroBackground } from '../components/HeroBackground'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/feed')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative flex flex-1 items-start justify-center overflow-hidden bg-[#fbf8f3] px-4 pt-16 pb-16 sm:pt-20">
      <HeroBackground />

      <div className="stationery-card relative w-full max-w-sm rounded-[1.75rem] px-7 py-10 sm:px-9">
        <h1 className="font-body text-center text-2xl font-extrabold tracking-tight text-[#2C4870]">
          Welcome back
        </h1>
        <p className="font-body mt-1.5 text-center text-sm text-[#4B5A73]">
          Log in to your Haven Circle account.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="login-email" className="font-body mb-1 block text-sm text-[#4B5A73]">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-body w-full rounded-xl border border-[#2C4870]/15 bg-white px-3 py-2 text-[#2C4870] focus:border-[#2C4870]/40 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="font-body mb-1 block text-sm text-[#4B5A73]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-body w-full rounded-xl border border-[#2C4870]/15 bg-white px-3 py-2 text-[#2C4870] focus:border-[#2C4870]/40 focus:outline-none"
            />
          </div>
          {error && <p className="font-body text-sm text-[#B23A5C]">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="font-body w-full rounded-full bg-[#2C4870] px-4 py-2.5 text-sm font-semibold text-[#FFFDF9] shadow-[0_8px_20px_rgba(44,72,112,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="font-body mt-5 text-center text-sm text-[#4B5A73]">
          No account?{' '}
          <Link to="/register" className="font-semibold text-[#2C4870] underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  )
}
