import { Link, useLocation } from "react-router-dom";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { orderId, total, items = [] } = state || {};

  // If landed here directly without state (e.g. page refresh), show generic message
  if (!state) {
    return (
      <section className="section confirm-page">
        <div className="confirm-card">
          <div className="confirm-icon">✓</div>
          <h1 className="confirm-title">Order placed!</h1>
          <p className="confirm-sub">
            Thanks for your purchase. Check your email for a receipt.
          </p>
          <Link className="cta" to="/shop">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">✓</div>
        <h1 className="confirm-title">Order placed!</h1>
        {orderId && (
          <p className="confirm-order-id">Order #{orderId}</p>
        )}
        <p className="confirm-sub">
          Thanks for your purchase. You'll receive a confirmation email shortly.
        </p>

        {items.length > 0 && (
          <ul className="confirm-items">
            {items.map((item) => {
              const price =
                item.price != null
                  ? Number(item.price)
                  : parseFloat(item.priceLabel?.replace(/[^0-9.]/g, "") || "0");
              return (
                <li key={item.id} className="confirm-item">
                  <div className={`confirm-item-swatch card-${item.accent}`} />
                  <span className="confirm-item-title">{item.title}</span>
                  <span className="confirm-item-qty">× {item.qty}</span>
                  <span className="confirm-item-price">
                    ${(price * item.qty).toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {total != null && (
          <p className="confirm-total">
            Total paid <span>${Number(total).toFixed(2)}</span>
          </p>
        )}

        <div className="confirm-actions">
          <Link className="cta" to="/shop">
            Continue shopping
          </Link>
          <Link className="cta ghost" to="/">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
