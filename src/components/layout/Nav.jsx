import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Nav() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-mark">CAP</span>
        <div>
          <p className="brand-title">Portfolio Store</p>
          <p className="brand-sub">Design, dev, and digital goods.</p>
        </div>
      </div>
      <nav className="site-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>
        <NavLink to="/messaging">Messaging</NavLink>
      </nav>
      <div className="nav-actions">
        <NavLink to="/cart" className="cart-icon" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {itemCount > 0 && (
            <span className="cart-badge">{itemCount}</span>
          )}
        </NavLink>
        {user ? (
          <>
            {isAdmin && <NavLink to="/admin" className="nav-admin">Admin</NavLink>}
            <button className="nav-account" onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <NavLink className="nav-account" to="/login">Sign in</NavLink>
        )}
        <NavLink className="cta" to="/messaging">
          Start a project
        </NavLink>
      </div>
    </header>
  );
}

export default Nav;
