import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError("Username is required.");
    if (!password) return setError("Password is required.");

    if (mode === "signup") {
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
    }

    // STILL UI-only for now:
    // We store username to "log in" and ignore password validation on refresh (backend auth is next step)
    localStorage.setItem("it_username", username.trim());
    localStorage.setItem("it_mode", mode);

    navigate("/");
  }

  return (
    <div className="appShell">
      <div className="page">
        <h1 className="title">{mode === "login" ? "Login" : "Sign up"}</h1>
        <p className="subtitle">
          {mode === "login"
            ? "Log in to access your internship tracker."
            : "Create an account to start tracking internships."}
        </p>

        <div className="card">
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

            <button className="button" type="submit">
              {mode === "login" ? "Login" : "Create account"}
            </button>

            <button
              type="button"
              className="buttonSecondary"
              onClick={() => {
                setError(null);
                setMode((m) => (m === "login" ? "signup" : "login"));
              }}
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}