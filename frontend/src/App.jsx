import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";
const STATUSES = ["applied", "interviewing", "offer", "rejected"];

export default function App() {
  // Add form fields
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");

  // List data
  const [internships, setInternships] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal (edit) states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("applied");
  const [editError, setEditError] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

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

  // Opens the modal and pre-fills fields from the selected internship
  function openEdit(it) {
    setEditError(null);
    setEditId(it.id);
    setEditCompany(it.company);
    setEditRole(it.role);
    setEditStatus(it.status);
    setIsEditOpen(true);
  }

  function closeEdit() {
    setIsEditOpen(false);
    setEditId(null);
    setEditCompany("");
    setEditRole("");
    setEditStatus("applied");
    setEditError(null);
    setEditSaving(false);
  }

  async function saveEdit() {
    setEditError(null);

    if (!editCompany.trim() || !editRole.trim()) {
      setEditError("Company and role are required.");
      return;
    }

    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/internships/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: editCompany.trim(),
          role: editRole.trim(),
          status: editStatus,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Update failed: ${res.status} ${msg}`);
      }

      await loadInternships();
      closeEdit();
    } catch (e) {
      setEditError(String(e));
      setEditSaving(false);
    }
  }

  async function deleteInternship(id) {
    if (!confirm("Delete this internship?")) return;

    setError(null);
    try {
      const res = await fetch(`${API_BASE}/internships/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Delete failed: ${res.status} ${msg}`);
      }

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
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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

                    <div className="itemActions">
                      <span className={`badge badge--${it.status}`}>
                        {it.status}
                      </span>

                      <button
                        type="button"
                        className="iconButton"
                        title="Edit"
                        onClick={() => openEdit(it)}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="iconButton iconButtonDanger"
                        title="Delete"
                        onClick={() => deleteInternship(it.id)}
                      >
                        🗑
                      </button>
                    </div>
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

      {/* Modal */}
      {isEditOpen && (
        <div className="modalOverlay" onMouseDown={closeEdit}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3 className="modalTitle">Edit internship</h3>
              <button
                type="button"
                className="iconButton"
                onClick={closeEdit}
                title="Close"
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              <div className="field">
                <label className="label">Company</label>
                <input
                  className="input"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Role</label>
                <input
                  className="input"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label">Status</label>
                <select
                  className="select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {editError && <div className="alert">{editError}</div>}
            </div>

            <div className="modalFooter">
              <button
                type="button"
                className="buttonSecondary"
                onClick={closeEdit}
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={saveEdit}
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}