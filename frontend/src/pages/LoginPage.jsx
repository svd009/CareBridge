import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const destination = location.state?.from?.pathname || '/dashboard'

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const result = login({ email, password })

    if (!result.success) {
      setError(result.message)
      return
    }

    navigate(destination, { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">CB</div>

        <p className="eyebrow">CareBridge Portal</p>
        <h1>Welcome back</h1>
        <p className="muted">
          Sign in to securely access your care coordination workspace.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Work email
            <input
              id="email"
              type="email"
              placeholder="clinician@carebridge.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" type="submit">
            Sign in
          </button>
        </form>

        <p className="demo-note">
          Demo mode: enter any valid email and any password.
        </p>
      </section>
    </main>
  )
}

export default LoginPage