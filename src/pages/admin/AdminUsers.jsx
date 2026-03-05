import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils";

const ROLES = ["user", "moderator", "admin"];

function AdminUsers() {
  const { token, user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setUsers(r.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  async function updateRole(id, role) {
    if (id === me?.id) {
      alert("You cannot change your own role.");
      return;
    }
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await apiClient.patch(`/admin/users/${id}/role`, { role }, { headers });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
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
        <h1 className="admin-heading">Users</h1>
        <span className="admin-count">{users.length} total</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.id === me?.id ? "admin-row-self" : ""}>
                <td className="admin-id">{u.id}</td>
                <td>
                  {u.email}
                  {u.id === me?.id && (
                    <span className="admin-you-badge"> (you)</span>
                  )}
                </td>
                <td>
                  <select
                    className={`admin-role-select role-bg-${u.role}`}
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    disabled={saving[u.id] || u.id === me?.id}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="admin-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="admin-empty">No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
