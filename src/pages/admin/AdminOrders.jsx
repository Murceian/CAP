import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils";

const ORDER_STATUSES = ["pending", "paid", "shipped", "fulfilled", "cancelled"];

function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({}); // { [id]: bool }

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/admin/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setOrders(r.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  async function updateStatus(id, status) {
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await apiClient.patch(
        `/admin/orders/${id}/status`,
        { status },
        { headers }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  }

  if (loading) return <p className="api-loading">Loading…</p>;
  if (error)   return <p className="api-error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-heading">Orders</h1>
        <span className="admin-count">{orders.length} total</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="admin-id">#{o.id}</td>
                <td>{o.userEmail || <span className="admin-muted">Guest</span>}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>
                  <select
                    className={`admin-status-select status-bg-${o.status}`}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={saving[o.id]}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="admin-muted">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="admin-muted admin-stripe">
                  {o.stripeId || "—"}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
