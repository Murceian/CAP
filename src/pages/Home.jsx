import { Link } from "react-router-dom";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Twitter / X", href: "https://x.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

const ctaCards = [
  {
    label: "Shop",
    description: "Digital packs, prints, and bundles ready to ship or download.",
    to: "/shop",
    accent: "#58a6ff",
  },
  {
    label: "Services",
    description: "Brand, photo, and web sprints. Scoped, fast, and focused.",
    to: "/services",
    accent: "#56d4bc",
  },
  {
    label: "Portfolio",
    description: "Selected work across identity, web, and editorial photography.",
    to: "/portfolio",
    accent: "#a78bfa",
  },
];

function Home() {
  return (
    <div className="page-home">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="eyebrow home-eyebrow">Creative &amp; Digital</p>
          <h1 className="home-headline">
            MVP for Capstone Store
          </h1>
          <p className="home-tagline">
            A one-person studio making brand identities, building web experiences,
            and selling digital tools — all in one place.
          </p>
          <div className="home-hero-actions">
            <Link className="cta" to="/shop">Browse the shop</Link>
            <Link className="cta ghost" to="/messaging">Start a project</Link>
          </div>
        </div>
        <div className="home-hero-visual">
          <div className="photo-placeholder">
            <span className="photo-placeholder-label">Photo</span>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────── */}
      <section className="home-about">
        <div className="home-about-copy">
          <p className="eyebrow">About</p>
          <h2 className="home-about-heading">Built for makers who move fast.</h2>
          <p className="home-about-body">
            CAP is a Portland-based studio that keeps things tight and intentional.
            No bloat, no long runways — just sharp work delivered on time. Whether
            you need a brand identity, a one-page site, or a set of audio loops for
            your next release, this is the place.
          </p>
          <p className="home-about-body">
            Available for client work, open for April.
          </p>
          <div className="home-social">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Row ──────────────────────────────────── */}
      <section className="home-cta-row">
        {ctaCards.map((card) => (
          <Link key={card.label} to={card.to} className="home-cta-card">
            <p className="home-cta-card-label" style={{ color: card.accent }}>
              {card.label}
            </p>
            <p className="home-cta-card-desc">{card.description}</p>
            <span className="home-cta-card-arrow" style={{ color: card.accent }}>
              → Explore
            </span>
          </Link>
        ))}
      </section>

    </div>
  );
}

export default Home;
