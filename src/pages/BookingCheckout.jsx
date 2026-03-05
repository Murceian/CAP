import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils";

/** Parse a price string like "$320" or "From $320" into a number */
function parsePrice(priceStr = "") {
  const n = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

/** Turn a camelCase key into a readable label */
function labelFromKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function BookingCheckout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [contact, setContact] = useState({ name: user?.name || "", email: user?.email || "" });
  const [card, setCard] = useState({ holderName: "", number: "", expiry: "", cvc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Guard: if arrived without state (direct nav / refresh)
  if (!state?.service || !state?.tier) {
    return (
      <div className="checkout-page">
        <p className="api-error">
          No booking details found.{" "}
          <Link to="/services">Browse services</Link>
        </p>
      </div>
    );
  }

  const { service, tier, formData } = state;
  const priceNum = parsePrice(tier.price);

  // ── Card input formatting ──────────────────────────────
  function handleCard(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === "number")
      v = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry")
      v = value.replace(/\D/g, "").slice(0, 4).replace(/^(.{2})(.+)/, "$1/$2");
    if (name === "cvc") v = value.replace(/\D/g, "").slice(0, 4);
    setCard((prev) => ({ ...prev, [name]: v }));
  }

  function handleContact(e) {
    setContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Submit ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);

    try {
      let bookingId = null;

      if (user && token) {
        // Resolve the date field regardless of which key the form used
        const bookedAt =
          formData.deadline ||
          formData.shootDate ||
          formData.preferredDate ||
          null;

        const res = await apiClient.post(
          "/bookings",
          {
            serviceId: service.id,
            tier: tier.name.toLowerCase(),
            bookedAt,
            notes: JSON.stringify({ ...formData, contact }),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        bookingId = res.data.id;
      }

      navigate("/booking-confirmation", {
        state: { bookingId, service, tier, formData, contact },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-heading">Review &amp; confirm</h1>

      <div className="checkout-layout">
        {/* ── Booking summary sidebar ── */}
        <aside className="checkout-summary">
          <h2>Booking summary</h2>

          <div className="booking-summary-service">
            <p className="booking-summary-title">{service.title}</p>
            <p className="booking-summary-tier">{tier.name} package</p>
          </div>

          <ul className="tier-features booking-summary-features">
            {tier.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <div className="checkout-total">
            Total{" "}
            <strong>
              {priceNum > 0 ? tier.price : "TBD"}
            </strong>
          </div>

          {/* Collapsible project details recap */}
          <details className="booking-data-summary">
            <summary>Your project details</summary>
            <dl className="booking-data-list">
              {Object.entries(formData)
                .filter(([, v]) => v !== "" && v !== null && v !== undefined)
                .map(([k, v]) => (
                  <div key={k} className="booking-data-row">
                    <dt>{labelFromKey(k)}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </details>
        </aside>

        {/* ── Checkout form ── */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          {!user && (
            <div className="booking-auth-notice">
              <p>
                <Link to="/login">Sign in</Link> or{" "}
                <Link to="/register">create an account</Link> to save your
                booking history. You can still complete as a guest.
              </p>
            </div>
          )}

          <h2>Contact</h2>

          <div className="checkout-field">
            <label htmlFor="bc-name">Full name *</label>
            <input
              id="bc-name"
              name="name"
              type="text"
              value={contact.name}
              onChange={handleContact}
              required
              placeholder="Jane Smith"
              className="booking-input"
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="bc-email">Email address *</label>
            <input
              id="bc-email"
              name="email"
              type="email"
              value={contact.email}
              onChange={handleContact}
              required
              placeholder="jane@example.com"
              className="booking-input"
            />
          </div>

          <h2>Payment</h2>

          <div className="checkout-field">
            <label htmlFor="bc-holder">Name on card *</label>
            <input
              id="bc-holder"
              name="holderName"
              type="text"
              value={card.holderName}
              onChange={handleCard}
              required
              placeholder="Jane Smith"
              className="booking-input"
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="bc-number">Card number *</label>
            <input
              id="bc-number"
              name="number"
              type="text"
              inputMode="numeric"
              value={card.number}
              onChange={handleCard}
              required
              placeholder="1234 5678 9012 3456"
              className="booking-input"
            />
          </div>

          <div className="checkout-field-row">
            <div className="checkout-field">
              <label htmlFor="bc-expiry">Expiry *</label>
              <input
                id="bc-expiry"
                name="expiry"
                type="text"
                inputMode="numeric"
                value={card.expiry}
                onChange={handleCard}
                required
                placeholder="MM/YY"
                className="booking-input"
              />
            </div>
            <div className="checkout-field">
              <label htmlFor="bc-cvc">CVC *</label>
              <input
                id="bc-cvc"
                name="cvc"
                type="text"
                inputMode="numeric"
                value={card.cvc}
                onChange={handleCard}
                required
                placeholder="123"
                className="booking-input"
              />
            </div>
          </div>

          {serverError && <p className="checkout-error">{serverError}</p>}

          <button
            type="submit"
            className="cta checkout-submit"
            disabled={submitting}
          >
            {submitting ? "Processing…" : `Confirm & pay ${tier.price}`}
          </button>

          <p className="checkout-secure-note">
            🔒 Payments are processed securely. No card data is stored.
          </p>
        </form>
      </div>
    </div>
  );
}

export default BookingCheckout;
