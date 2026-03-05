import { useState, useEffect } from "react";
import { logger, apiClient } from "../utils";
import { Card } from "../components";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/services")
      .then((res) => {
        setServices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        logger.error("Failed to load services", err);
        setError(err.message || "Failed to load services");
        setLoading(false);
      });
  }, []);

  return (
    <section className="section page-services" id="services">
      <div className="section-header">
        <div>
          <p className="eyebrow">Services</p>
          <h2>Start with a focused sprint</h2>
          <p className="section-copy">
            Small, scoped offers that move the brand forward without a long
            runway.
          </p>
        </div>
      </div>
      {loading && <p className="api-loading">Loading services…</p>}
      {error && <p className="api-error">{error}</p>}
      {!loading && !error && (
        <div className="card-grid">
          {services.map((item, index) => (
            <Card key={item.id} item={item} index={index} to={`/services/${item.id}`} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Services;
