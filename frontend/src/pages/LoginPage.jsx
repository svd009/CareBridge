import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      if (!accessToken || !user) {
        throw new Error("The server returned an incomplete login response.");
      }

      login({ accessToken, user });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      const status = requestError.response?.status;
      const message = requestError.response?.data?.message;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 400) {
        setError(message || "Enter a valid email and password.");
      } else {
        setError(
          message || "Unable to sign in right now. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <span>+</span>
          </div>

          <div>
            <p className="auth-kicker">SECURE CARE PORTAL</p>
            <h1 id="login-title">CareBridge</h1>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Sign in to access authorized patient records.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@carebridge.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-field">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="sign-in-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <p className="auth-footer">
          Authorized CareBridge personnel only. Patient activity is monitored.
        </p>
      </section>
    </main>
  );
}