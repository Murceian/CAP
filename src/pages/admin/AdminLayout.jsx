import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin",          label: "Dashboard",  end: true },
  { to: "/admin/products", label: "Products"  },
  { to: "/admin/services", label: "Services"  },
  { to: "/admin/orders",   label: "Orders"    },
  { to: "/admin/bookings", label: "Bookings"  },
  { to: "/admin/users",    label: "Users"     },
];

function AdminLayout() {
  const { token, isAdmin } = useAuth();
  if (!token)   return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <p className="admin-sidebar-title">Admin</p>
        {NAV.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? " admin-nav-link-active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
