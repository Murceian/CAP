import { Route, Routes } from "react-router-dom";
import { Nav } from "./components/layout";
import { AdminRoute, ErrorBoundary, PrivateRoute } from "./components";
import {
  BookingCheckout,
  BookingConfirmation,
  Cart,
  Checkout,
  Home,
  Login,
  Messaging,
  OrderConfirmation,
  Portfolio,
  PortfolioDetail,
  ProductDetail,
  Register,
  ServiceDetail,
  Services,
  Shop,
} from "./pages";
import {
  AdminLayout,
  AdminDashboard,
  AdminProducts,
  AdminServices,
  AdminOrders,
  AdminBookings,
  AdminUsers,
} from "./pages/admin";
import "./App.css";
function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <Nav />
        <main className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<PortfolioDetail />} />
            <Route path="/messaging" element={<PrivateRoute><Messaging /></PrivateRoute>} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/booking-checkout" element={<BookingCheckout />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route
              path="/admin"
              element={<AdminLayout />}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="orders"   element={<AdminOrders />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users"    element={<AdminUsers />} />
            </Route>
          </Routes>
        </main>
        <footer className="site-footer">
          <p>CAP Portfolio Store</p>
          <div className="footer-links">
            <span>Availability: Open for April</span>
            <span>Based in Portland</span>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
