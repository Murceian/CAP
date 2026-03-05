import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils";

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [expanded, setExpanded] = useState(null); // booking id whose notes are shown

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/admin/bookings", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { setBookings(r.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  async function updateStatus(id, status) {
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await apiClient.patch(
        `/admin/bookings/${id}/status`,
        { status },
        { headers }
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setSaving((p) => ({ ...p, [id]: false }));
    }
  }

  /** Parse the notes JSON that Checkout stores as a stringified object */
  function parseNotes(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return { raw }; }
  }

  if (loading) return <p className="api-loading">Loading…</p>;
  if (error)   return <p className="api-error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-heading">Bookings</h1>
        <span className="admin-count">{bookings.length} total</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Service</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const notes = parseNotes(b.notes);
              const isOpen = expanded === b.id;
              return (
                <>
                  <tr key={b.id}>
                    <td className="admin-id">#{b.id}</td>
                    <td>{b.userEmail || <span className="admin-muted">Guest</span>}</td>
                    <td>{b.serviceTitle}</td>
                    <td className="admin-tier-cap">{b.tier}</td>
                    <td>
                      <select
                        className={`admin-status-select status-bg-${b.status}`}
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        disabled={saving[b.id]}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="admin-muted">
                      {b.bookedAt
                        ? new Date(b.bookedAt).toLocaleDateString()
                        : new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {notes && (
                        <button
                          className="admin-btn-edit"
                          onClick={() => setExpanded(isOpen ? null : b.id)}
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isOpen && notes && (
                    <tr key={`${b.id}-notes`} className="admin-notes-row">
                      <td colSpan={7}>
                        <div className="admin-notes-panel">
                          <strong>Project details</strong>
                          <dl className="booking-data-list">
                            {Object.entries(notes)
                              .filter(([, v]) => v !== "" && v !== null)
                              .map(([k, v]) => (
                                <div key={k} className="booking-data-row">
                                  <dt style={{ textTransform: "capitalize" }}>
                                    {k.replace(/([A-Z])/g, " $1")}
                                  </dt>
                                  <dd>
                                    {typeof v === "object"
                                      ? JSON.stringify(v)
                                      : String(v)}
                                  </dd>
                                </div>
                              ))}
                          </dl>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {bookings.length === 0 && (
              <tr><td colSpan={7} className="admin-empty">No bookings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBookings;
