import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../utils";

function PortfolioDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get(`/portfolio/${id}`)
      .then((res) => {
        setItem(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Project not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page page-portfolio">
        <Link to="/portfolio" className="detail-back">← Back to portfolio</Link>
        <p className="api-loading">Loading…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="detail-not-found">
        <p>{error || "Project not found."}</p>
        <Link to="/portfolio" className="detail-back">
          ← Back to portfolio
        </Link>
      </div>
    );
  }

  // Placeholder media slots — will be replaced with real media in Phase 3+
  const mediaSlots = Array.from({ length: 4 });

  return (
    <section className="detail-page page-portfolio">
      <Link to="/portfolio" className="detail-back">
        ← Back to portfolio
      </Link>
      <div className="detail-layout">
        <div className={`detail-media card-${item.accent}`}>
          <div className="card-media" style={{ height: "100%" }} />
        </div>
        <div className="detail-body">
          <div className="detail-tags">
            {item.tags?.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
          <h1 className="detail-heading">{item.title}</h1>
          {item.subtitle && <p className="detail-sub">{item.subtitle}</p>}
          {item.meta?.length ? (
            <ul className="meta detail-meta">
              {item.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* ── Media grid ─────────────────────────────── */}
      <div className="portfolio-media-grid">
        {mediaSlots.map((_, i) => (
          <div key={i} className={`portfolio-media-slot card-${item.accent}`}>
            <span className="photo-placeholder-label">Media {i + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PortfolioDetail;
