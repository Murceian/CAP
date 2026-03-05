import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../utils";
import { useCart } from "../context/CartContext";

function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Product not found");
        setLoading(false);
      });
  }, [id]);

  function handleAdd() {
    if (!product) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (loading) {
    return (
      <div className="detail-page page-shop">
        <Link to="/shop" className="detail-back">← Back to shop</Link>
        <p className="api-loading">Loading…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-not-found">
        <p>{error || "Product not found."}</p>
        <Link to="/shop" className="detail-back">
          ← Back to shop
        </Link>
      </div>
    );
  }

  return (
    <section className="detail-page page-shop">
      <Link to="/shop" className="detail-back">
        ← Back to shop
      </Link>
      <div className="detail-layout">
        <div className={`detail-media card-${product.accent}`}>
          <div className="card-media" style={{ height: "100%" }} />
        </div>
        <div className="detail-body">
          <div className="detail-tags">
            {product.tags?.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
          <h1 className="detail-heading">{product.title}</h1>
          {product.subtitle && (
            <p className="detail-sub">{product.subtitle}</p>
          )}
          {product.meta?.length ? (
            <ul className="meta detail-meta">
              {product.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
          <p className="detail-price">{product.priceLabel}</p>
          <button
            className={`cta detail-cta${added ? " cta-added" : ""}`}
            onClick={handleAdd}
          >
            {added ? "Added to cart ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
