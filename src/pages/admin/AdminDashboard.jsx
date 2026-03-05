import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils";

const ORDER_STATUSES = ["pending", "paid", "shipped", "fulfilled", "cancelled"];

function statusClass(s) {
  const map = {
    pending: "status-pending",
    paid: "status-paid",
    shipped: "status-shipped",
    fulfilled: "status-fulfilled",
    cancelled: "status-cancelled",
  };
  return map[s] || "";
}

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setStats(r.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  if (loading) return <p className="api-loading">Loading stats…</p>;
  if (error)   return <p className="api-error">{error}</p>;

  const cards = [
    { label: "Products",  value: stats.products,  to: "/admin/products" },
    { label: "Services",  value: stats.services,  to: "/admin/services" },
    { label: "Portfolio", value: stats.portfolio,  to: null },
    { label: "Orders",    value: stats.orders,     to: "/admin/orders"   },
    { label: "Bookings",  value: stats.bookings,   to: "/admin/bookings" },
    { label: "Users",     value: stats.users,      to: "/admin/users"    },
    {
      label: "Revenue",
      value: `$${Number(stats.revenue).toFixed(2)}`,
      to: null,
      wide: true,
    },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-heading">Dashboard</h1>

      <div className="admin-stat-grid">
        {cards.map(({ label, value, to, wide }) => (
          <div key={label} className={`admin-stat-card${wide ? " admin-stat-wide" : ""}`}>
            <span className="admin-stat-value">{value}</span>
            <span className="admin-stat-label">
              {to ? <Link to={to}>{label}</Link> : label}
            </span>
          </div>
        ))}
      </div>

      <h2 className="admin-subheading">Recent orders</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id}>
                <td className="admin-id">#{o.id}</td>
                <td>{o.userEmail || "—"}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>
                  <span className={`admin-status ${statusClass(o.status)}`}>{o.status}</span>
                </td>
                <td className="admin-muted">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {stats.recentOrders.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
