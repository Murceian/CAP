import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../utils";

function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get(`/services/${id}`)
      .then((res) => {
        setService(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Service not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page page-services">
        <Link to="/services" className="detail-back">← Back to services</Link>
        <p className="api-loading">Loading…</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="detail-not-found">
        <p>{error || "Service not found."}</p>
        <Link to="/services" className="detail-back">
          ← Back to services
        </Link>
      </div>
    );
  }

  const tierOrder = ["basic", "standard", "premium"];

  return (
    <section className="detail-page page-services">
      <Link to="/services" className="detail-back">
        ← Back to services
      </Link>
      <div className="detail-layout">
        <div className={`detail-media card-${service.accent}`}>
          <div className="card-media" style={{ height: "100%" }} />
        </div>
        <div className="detail-body">
          <div className="detail-tags">
            {service.tags?.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
          <h1 className="detail-heading">{service.title}</h1>
          {service.subtitle && (
            <p className="detail-sub">{service.subtitle}</p>
          )}
          {service.meta?.length ? (
            <ul className="meta detail-meta">
              {service.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* ── Tier cards ─────────────────────────────── */}
      {service.tiers && (
        <div className="tier-section">
          <h2 className="tier-heading">Choose a package</h2>
          <div className="tier-grid">
            {tierOrder.map((key) => {
              const tier = service.tiers[key];
              if (!tier) return null;
              return (
                <div
                  key={key}
                  className={`tier-card${key === "standard" ? " tier-card-featured" : ""}`}
                >
                  {key === "standard" && (
                    <span className="tier-badge">Most popular</span>
                  )}
                  <p className="tier-name">{tier.name}</p>
                  <p className="tier-price">{tier.price}</p>
                  <ul className="tier-features">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button className={`cta${key === "standard" ? "" : " ghost"} tier-cta`}>
                    Book {tier.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default ServiceDetail;
