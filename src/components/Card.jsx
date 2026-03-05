import { Link } from "react-router-dom";

function Card({ item, index, to }) {
  const Tag = to ? Link : "article";
  const extraProps = to ? { to } : {};

  return (
    <Tag
      {...extraProps}
      className={`card card-${item.accent}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="card-media" />
      <div className="card-body">
        <div className="card-title">
          <h3>{item.title}</h3>
          {item.priceLabel && <span className="price">{item.priceLabel}</span>}
        </div>
        {item.subtitle && <p className="subtitle">{item.subtitle}</p>}
        {item.meta?.length ? (
          <ul className="meta">
            {item.meta.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ) : null}
        {item.tags?.length ? (
          <div className="tags">
            {item.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}

export default Card;
