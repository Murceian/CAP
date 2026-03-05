import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils";

const ACCENTS = ["peach", "mint", "sky", "amber", "lavender"];

const DEFAULT_TIERS = JSON.stringify(
  {
    basic:    { name: "Basic",    price: "$0", features: ["Feature 1"] },
    standard: { name: "Standard", price: "$0", features: ["Feature 1", "Feature 2"] },
    premium:  { name: "Premium",  price: "$0", features: ["Feature 1", "Feature 2", "Feature 3"] },
  },
  null,
  2
);

const EMPTY = {
  title: "", subtitle: "", priceLabel: "", tags: "",
  accent: "peach", imageUrl: "", tiersJson: DEFAULT_TIERS,
};

function ServiceModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [tiersError, setTiersError] = useState(null);

  function set(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    let tiers = null;
    try {
      tiers = JSON.parse(form.tiersJson);
      setTiersError(null);
    } catch {
      setTiersError("Tiers JSON is invalid. Please fix before saving.");
      return;
    }
    onSave({
      ...form,
      tiers,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    });
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-modal-title">
          {initial.id ? "Edit service" : "New service"}
        </h3>
        <form onSubmit={submit} className="admin-form">
          <div className="admin-field">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={set} required className="booking-input" />
          </div>
          <div className="admin-field">
            <label>Subtitle</label>
            <input name="subtitle" value={form.subtitle} onChange={set} className="booking-input" />
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Price label</label>
              <input name="priceLabel" value={form.priceLabel} onChange={set} placeholder="From $220" className="booking-input" />
            </div>
            <div className="admin-field">
              <label>Accent colour</label>
              <select name="accent" value={form.accent} onChange={set} className="booking-input">
                {ACCENTS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-field">
            <label>Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={set} placeholder="design, web" className="booking-input" />
          </div>
          <div className="admin-field">
            <label>Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={set} className="booking-input" placeholder="https://…" />
          </div>
          <div className="admin-field">
            <label>Tiers (JSON)</label>
            <textarea
              name="tiersJson"
              value={form.tiersJson}
              onChange={set}
              rows={12}
              className={`booking-input admin-json-area${tiersError ? " input-error" : ""}`}
              spellCheck={false}
            />
            {tiersError && <p className="admin-field-error">{tiersError}</p>}
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="cta ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="cta">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminServices() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/admin/services", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setItems(r.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  async function handleSave(data) {
    setSaving(true);
    try {
      if (data.id) {
        const r = await apiClient.put(`/admin/services/${data.id}`, data, { headers });
        setItems((prev) => prev.map((s) => (s.id === data.id ? r.data : s)));
      } else {
        const r = await apiClient.post("/admin/services", data, { headers });
        setItems((prev) => [r.data, ...prev]);
      }
      setEditing(null);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this service?")) return;
    await apiClient.delete(`/admin/services/${id}`, { headers });
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  function openEdit(item) {
    setEditing({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      imageUrl: item.imageUrl || "",
      priceLabel: item.priceLabel || "",
      tiersJson: item.tiers ? JSON.stringify(item.tiers, null, 2) : DEFAULT_TIERS,
    });
  }

  if (loading) return <p className="api-loading">Loading…</p>;
  if (error)   return <p className="api-error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-heading">Services</h1>
        <button className="cta" onClick={() => setEditing({ ...EMPTY })}>+ New service</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Price</th><th>Tags</th><th>Accent</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td className="admin-id">{s.id}</td>
                <td>
                  <strong>{s.title}</strong>
                  {s.subtitle && <span className="admin-muted"> — {s.subtitle}</span>}
                </td>
                <td>{s.priceLabel || "—"}</td>
                <td className="admin-muted">
                  {Array.isArray(s.tags) ? s.tags.join(", ") : "—"}
                </td>
                <td>
                  <span className={`accent-dot accent-dot-${s.accent}`} />
                  {s.accent}
                </td>
                <td className="admin-actions">
                  <button className="admin-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                  <button className="admin-btn-del" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">No services</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <ServiceModal
          initial={editing}
          onSave={handleSave}
          onClose={() => !saving && setEditing(null)}
        />
      )}
    </div>
  );
}

export default AdminServices;
