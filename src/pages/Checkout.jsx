import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils";

function CheckoutItem({ item }) {
  const price =
    item.price != null
      ? Number(item.price)
      : parseFloat(item.priceLabel?.replace(/[^0-9.]/g, "") || "0");
  return (
    <li className="checkout-item">
      <div className={`checkout-item-swatch card-${item.accent}`} />
      <div className="checkout-item-info">
        <span className="checkout-item-title">{item.title}</span>
        <span className="checkout-item-sub">{item.subtitle}</span>
      </div>
      <span className="checkout-item-qty">× {item.qty}</span>
      <span className="checkout-item-price">${(price * item.qty).toFixed(2)}</span>
    </li>
  );
}

export default function Checkout() {
  const { items, clearCart, itemCount } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = items.reduce((sum, item) => {
    const price =
      item.price != null
        ? Number(item.price)
        : parseFloat(item.priceLabel?.replace(/[^0-9.]/g, "") || "0");
    return sum + price * item.qty;
  }, 0);

  if (itemCount === 0) {
    return (
      <section className="section cart-empty">
        <p className="eyebrow">Checkout</p>
        <h2>Your cart is empty</h2>
        <Link className="cta" to="/shop" style={{ display: "inline-block", marginTop: "16px" }}>
          Browse the shop
        </Link>
      </section>
    );
  }

  function formatCardNum(val) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
    return digits;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // When Stripe is integrated, create a PaymentIntent here first.
      // For now, we post the order directly to the API.
      const orderItems = items.map((item) => ({
        productId: item.id,
        qty: item.qty,
        price:
          item.price != null
            ? Number(item.price)
            : parseFloat(item.priceLabel?.replace(/[^0-9.]/g, "") || "0"),
      }));

      let orderId = null;

      if (token) {
        // Logged-in: persist the order to the DB
        const res = await apiClient.post(
          "/orders",
          { items: orderItems },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        orderId = res.data.id;
      }

      clearCart();
      navigate("/order-confirmation", {
        state: { orderId, total, items: [...items] },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section checkout-page">
      <p className="eyebrow">Checkout</p>
      <h2>Complete your order</h2>

      <div className="checkout-layout">
        {/* ── Order summary ── */}
        <div className="checkout-summary">
          <h3 className="checkout-section-title">Order summary</h3>
          <ul className="checkout-list">
            {items.map((item) => (
              <CheckoutItem key={item.id} item={item} />
            ))}
          </ul>
          <div className="checkout-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* ── Payment form ── */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3 className="checkout-section-title">Contact</h3>
          <label className="auth-label">
            Full name
            <input
              className="auth-input"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="auth-label">
            Shipping address
            <input
              className="auth-input"
              type="text"
              placeholder="Optional for digital goods"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>

          <h3 className="checkout-section-title" style={{ marginTop: "24px" }}>
            Payment
            <span className="checkout-stripe-badge">Stripe ready</span>
          </h3>

          <label className="auth-label">
            Card number
            <input
              className="auth-input checkout-card-input"
              type="text"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              required
              value={cardNum}
              onChange={(e) => setCardNum(formatCardNum(e.target.value))}
            />
          </label>

          <div className="checkout-card-row">
            <label className="auth-label">
              Expiry
              <input
                className="auth-input"
                type="text"
                inputMode="numeric"
                placeholder="MM / YY"
                required
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
            </label>
            <label className="auth-label">
              CVC
              <input
                className="auth-input"
                type="text"
                inputMode="numeric"
                placeholder="123"
                required
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </label>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Processing…" : `Pay $${total.toFixed(2)}`}
          </button>

          <p className="checkout-note">
            Test mode — no real charge. Stripe integration added in production.
          </p>
        </form>
      </div>
    </section>
  );
}
