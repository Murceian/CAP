import { Link, useLocation } from "react-router-dom";

function BookingConfirmation() {
  const { state } = useLocation();

  // Direct navigation / refresh — show a generic success message
  if (!state?.service || !state?.tier) {
    return (
      <div className="confirm-page">
        <div className="confirm-card">
          <div className="confirm-icon">✓</div>
          <h1>Booking received!</h1>
          <p className="confirm-message">
            We&rsquo;ll review your details and reach out within 1&ndash;2 business
            days to confirm your booking.
          </p>
          <div className="confirm-actions">
            <Link to="/services" className="cta ghost">
              Browse services
            </Link>
            <Link to="/" className="cta">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { bookingId, service, tier, contact } = state;

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">✓</div>
        <h1>Booking confirmed!</h1>

        {bookingId && (
          <p className="confirm-ref">
            Booking reference:{" "}
            <strong className="confirm-ref-id">#{bookingId}</strong>
          </p>
        )}

        <div className="booking-confirm-details">
          <div className="booking-confirm-row">
            <span className="confirm-label">Service</span>
            <span>{service.title}</span>
          </div>
          <div className="booking-confirm-row">
            <span className="confirm-label">Package</span>
            <span>{tier.name}</span>
          </div>
          <div className="booking-confirm-row">
            <span className="confirm-label">Price</span>
            <span>{tier.price}</span>
          </div>
          {contact?.email && (
            <div className="booking-confirm-row">
              <span className="confirm-label">Confirmation to</span>
              <span>{contact.email}</span>
            </div>
          )}
        </div>

        <p className="confirm-message">
          Your project details have been received. We&rsquo;ll review everything
          and reach out within 1&ndash;2 business days to confirm your booking
          and outline next steps.
        </p>

        <div className="confirm-actions">
          <Link to="/messaging" className="cta">
            Message us about this booking
          </Link>
          <Link to="/services" className="cta ghost">
            Back to services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
