import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const API_BASE = "http://localhost:5000";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const p = password;

    if (!u) return setError("Username is required.");
    if (!p) return setError("Password is required.");

    if (mode === "signup") {
      if (p.length < 6) return setError("Password must be at least 6 characters.");
      if (p !== confirmPassword) return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Request failed.");
        return;
      }

      // backend returns: { token, username }
      localStorage.setItem("it_token", data.token);
      localStorage.setItem("it_username", data.username);

      navigate("/");
    } catch (err) {
      setError(err?.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appShell">
      <div className="page page--auth">
        <div className="authHeader">
          <h1 className="title">{mode === "login" ? "Login" : "Sign up"}</h1>
          <p className="subtitle">
            {mode === "login"
              ? "Log in to access your internship tracker."
              : "Create an account to start tracking internships."}
          </p>
        </div>

        <div className="card authCard">
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. WHOISALIYAN"
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "signup" && (
              <div className="field">
                <label className="label">Confirm password</label>
                <input
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && <div className="alert">{error}</div>}

            <div className="formActions">
              <button className="button" type="submit" disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              </button>

              <button
                type="button"
                className="buttonSecondary"
                disabled={loading}
                onClick={() => {
                  setError(null);
                  setMode((m) => (m === "login" ? "signup" : "login"));
                }}
              >
                {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}