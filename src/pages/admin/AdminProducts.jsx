import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils";

const ACCENTS = ["peach", "mint", "sky", "amber", "lavender"];
const EMPTY = {
  title: "", subtitle: "", price: "", priceLabel: "",
  tags: "", accent: "peach", imageUrl: "",
};

function ProductModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);

  function set(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price),
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    });
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-modal-title">
          {initial.id ? "Edit product" : "New product"}
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
              <label>Price *</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={set} required className="booking-input" />
            </div>
            <div className="admin-field">
              <label>Price label</label>
              <input name="priceLabel" value={form.priceLabel} onChange={set} placeholder="$18" className="booking-input" />
            </div>
          </div>
          <div className="admin-field">
            <label>Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={set} placeholder="audio, digital" className="booking-input" />
          </div>
          <div className="admin-field">
            <label>Accent colour</label>
            <select name="accent" value={form.accent} onChange={set} className="booking-input">
              {ACCENTS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={set} className="booking-input" placeholder="https://…" />
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

function AdminProducts() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null=closed, {}=new, {...item}=edit
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/admin/products", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setItems(r.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  async function handleSave(data) {
    setSaving(true);
    try {
      if (data.id) {
        const r = await apiClient.put(`/admin/products/${data.id}`, data, { headers });
        setItems((prev) => prev.map((p) => (p.id === data.id ? r.data : p)));
      } else {
        const r = await apiClient.post("/admin/products", data, { headers });
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
    if (!window.confirm("Delete this product?")) return;
    await apiClient.delete(`/admin/products/${id}`, { headers });
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function openEdit(item) {
    setEditing({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      imageUrl: item.imageUrl || "",
      priceLabel: item.priceLabel || "",
    });
  }

  if (loading) return <p className="api-loading">Loading…</p>;
  if (error)   return <p className="api-error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-heading">Products</h1>
        <button className="cta" onClick={() => setEditing({ ...EMPTY })}>+ New product</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Price</th><th>Tags</th><th>Accent</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td className="admin-id">{p.id}</td>
                <td>
                  <strong>{p.title}</strong>
                  {p.subtitle && <span className="admin-muted"> — {p.subtitle}</span>}
                </td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td className="admin-muted">
                  {Array.isArray(p.tags) ? p.tags.join(", ") : "—"}
                </td>
                <td>
                  <span className={`accent-dot accent-dot-${p.accent}`} />
                  {p.accent}
                </td>
                <td className="admin-actions">
                  <button className="admin-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                  <button className="admin-btn-del" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">No products</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <ProductModal
          initial={editing}
          onSave={handleSave}
          onClose={() => !saving && setEditing(null)}
        />
      )}
    </div>
  );
}

export default AdminProducts;
