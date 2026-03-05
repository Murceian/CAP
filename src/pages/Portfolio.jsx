import { useState, useEffect } from "react";
import { logger, apiClient } from "../utils";
import { Card } from "../components";

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/portfolio")
      .then((res) => {
        setPortfolio(res.data);
        setLoading(false);
      })
      .catch((err) => {
        logger.error("Failed to load portfolio", err);
        setError(err.message || "Failed to load portfolio");
        setLoading(false);
      });
  }, []);

  return (
    <section className="section page-portfolio" id="portfolio">
      <div className="section-header">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h2>Recent work</h2>
          <p className="section-copy">
            Selected projects across brand, web, and photo.
          </p>
        </div>
      </div>
      {loading && <p className="api-loading">Loading projects…</p>}
      {error && <p className="api-error">{error}</p>}
      {!loading && !error && (
        <div className="card-grid">
          {portfolio.map((item, index) => (
            <Card key={item.id} item={item} index={index} to={`/portfolio/${item.id}`} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Portfolio;
