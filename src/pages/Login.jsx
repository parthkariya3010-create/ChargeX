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
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-glow">
          <Zap size={24} strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to your ChargeGrid account</p>
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
