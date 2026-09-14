import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [step, setStep] = useState("credentials");
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("doctor@medsecure.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function submitCredentials(event) {
    event.preventDefault();
    setError("");

    try {
      const { data } = await client.post("/auth/login", { email, password });
      setUserId(data.userId);
      setStep("mfa");
    } catch (err) {
      setError(err.response?.data?.message || "Sign-in failed.");
    }
  }

  async function submitMfa(event) {
    event.preventDefault();
    setError("");

    try {
      const { data } = await client.post("/auth/mfa/verify", { userId, token });
      login(data.accessToken, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "MFA verification failed.");
    }
  }

  return (
    <main>
      <h1>MedSecure</h1>
      <p>Secure patient records portal</p>

      {step === "credentials" ? (
        <form onSubmit={submitCredentials}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />

          <button type="submit">Continue</button>
        </form>
      ) : (
        <form onSubmit={submitMfa}>
          <label>Authenticator code</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
          />

          <button type="submit">Verify MFA</button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}
    </main>
  );
}