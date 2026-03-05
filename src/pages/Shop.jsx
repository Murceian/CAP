import { useState, useEffect } from "react";
import { logger, apiClient } from "../utils";
import { Card } from "../components";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("all");

  useEffect(() => {
    apiClient
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        logger.error("Failed to load products", err);
        setError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, []);

  // Generate product tags
  const productTags = (() => {
    try {
      const tagSet = new Set();
      products.forEach((product) => {
        product.tags?.forEach((tag) => tagSet.add(tag));
      });
      return ["all", ...Array.from(tagSet)];
    } catch (err) {
      logger.error("Failed to generate product tags", err);
      return ["all"];
    }
  })();

  // Filter products by active tag
  const filteredProducts = (() => {
    try {
      if (activeTag === "all") return products;
      return products.filter((product) => product.tags?.includes(activeTag));
    } catch (err) {
      logger.error("Failed to filter products", err);
      return products;
    }
  })();

  return (
    <section className="section page-shop" id="products">
      <div className="section-header">
        <div>
          <p className="eyebrow">Shop</p>
          <h2>Featured products</h2>
          <p className="section-copy">
            A mix of physical goods and digital packs designed for quick wins.
          </p>
        </div>
        <div className="tag-row">
          {productTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={tag === activeTag ? "tag-pill active" : "tag-pill"}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="api-loading">Loading products…</p>}
      {error && <p className="api-error">{error}</p>}
      {!loading && !error && (
        <div className="card-grid">
          {filteredProducts.map((item, index) => (
            <Card key={item.id} item={item} index={index} to={`/shop/${item.id}`} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Shop;
