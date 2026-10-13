import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await login(email, password)
      if (res?.user?.role === 'ADMIN' || res?.user?.role === 'HOST') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo(demoEmail, demoPassword) {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-glow">
          <Zap size={24} strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to your CHARGEX account</p>
      </div>

      <div className="mb-4 rounded-xl border border-border bg-surface p-3 text-xs">
        <p className="font-mono text-[11px] text-text-secondary uppercase tracking-wider mb-2">Quick Demo Fill</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin@chargex.in', 'admin123')}
            className="flex-1 rounded-lg border border-accent2/30 bg-accent2/10 py-1.5 font-medium text-accent2 hover:bg-accent2/20"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('host@chargex.in', 'host123')}
            className="flex-1 rounded-lg border border-accent/30 bg-accent/10 py-1.5 font-medium text-accent hover:bg-accent/20"
          >
            Host
          </button>
          <button
            type="button"
            onClick={() => fillDemo('driver@chargex.in', 'driver123')}
            className="flex-1 rounded-lg border border-border bg-elevated py-1.5 font-medium text-text-primary hover:bg-elevated2"
          >
            Driver
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <label className="block text-xs font-medium text-text-secondary">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aditya.rao@example.com"
            required
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none"
          />
        </label>

        <label className="block text-xs font-medium text-text-secondary">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <LogIn size={16} />
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
