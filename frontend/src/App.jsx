import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

export default function App() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadInternships() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/internships`);
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const data = await res.json();
      setInternships(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInternships();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!company.trim() || !role.trim()) {
      setError("Company and role are required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/internships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          status,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Create failed: ${res.status} ${msg}`);
      }

      setCompany("");
      setRole("");
      setStatus("applied");
      await loadInternships();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="appShell">
      <div className="page">
        <header className="header">
          <div>
            <h1 className="title">Internship Tracking</h1>
            <p className="subtitle">
              Track applications, interviews, offers, and results in one place.
            </p>
          </div>

          <div className="pill">
            <span className="pillDot" />
            Backend: <span className="pillText">connected</span>
          </div>
        </header>

        <main className="grid">
          <section className="card">
            <h2 className="cardTitle">Add internship</h2>

            <form onSubmit={onSubmit} className="form">
              <div className="field">
                <label className="label">Company</label>
                <input
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>

              <div className="field">
                <label className="label">Role</label>
                <input
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>

              <div className="field">
                <label className="label">Status</label>
                <select
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="applied">applied</option>
                  <option value="interviewing">interviewing</option>
                  <option value="offer">offer</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <button className="button" type="submit">
                Add
              </button>

              {error && <div className="alert">{error}</div>}
            </form>
          </section>

          <section className="card">
            <div className="listHeader">
              <h2 className="cardTitle">Your internships</h2>
              <div className="count">{internships.length}</div>
            </div>

            {loading && <p className="muted">Loading...</p>}
            {!loading && internships.length === 0 && (
              <p className="muted">No internships yet. Add one above.</p>
            )}

            <div className="list">
              {internships.map((it) => (
                <div key={it.id} className="item">
                  <div className="itemTop">
                    <div className="itemMain">
                      <div className="itemCompany">{it.company}</div>
                      <div className="itemRole">{it.role}</div>
                    </div>

                    <span className={`badge badge--${it.status}`}>
                      {it.status}
                    </span>
                  </div>

                  <div className="itemMeta">
                    Created: {new Date(it.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}