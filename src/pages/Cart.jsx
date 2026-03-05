import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { items, removeItem, clearCart, itemCount } = useCart();
  const navigate = useNavigate();

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
        <p className="eyebrow">Cart</p>
        <h2>Your cart is empty</h2>
        <p className="section-copy">
          Head to the shop to find something you like.
        </p>
        <Link className="cta" to="/shop" style={{ display: "inline-block", marginTop: "16px" }}>
          Browse the shop
        </Link>
      </section>
    );
  }

  return (
    <section className="section cart-page">
      <div className="section-header">
        <div>
          <p className="eyebrow">Cart</p>
          <h2>Your cart ({itemCount})</h2>
        </div>
      </div>

      <ul className="cart-list">
        {items.map((item) => {
          const price =
            item.price != null
              ? Number(item.price)
              : parseFloat(
                  item.priceLabel?.replace(/[^0-9.]/g, "") || "0"
                );
          return (
            <li key={item.id} className="cart-item">
              <div className={`cart-item-swatch card-${item.accent}`} />
              <div className="cart-item-info">
                <span className="cart-item-title">{item.title}</span>
                <span className="cart-item-sub">{item.subtitle}</span>
              </div>
              <span className="cart-item-qty">× {item.qty}</span>
              <span className="cart-item-price">
                ${(price * item.qty).toFixed(2)}
              </span>
              <button
                className="cart-item-remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.title}`}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <div className="cart-footer">
        <p className="cart-total">
          Total <span>${total.toFixed(2)}</span>
        </p>
        <div className="cart-actions">
          <button className="cta ghost" onClick={clearCart}>
            Clear cart
          </button>
          <button className="cta" onClick={() => navigate("/checkout")}>
            Checkout
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cart;
