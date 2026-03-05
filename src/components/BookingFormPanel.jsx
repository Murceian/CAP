import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Returns the set of service-specific fields based on the service's tags.
 * Falls back to a generic brief form if no recognised tag is found.
 */
function getFields(tags = []) {
  if (tags.includes("design")) {
    return [
      { name: "businessName",   label: "Business / brand name",        type: "text",     required: true,  placeholder: "e.g. Acme Co." },
      { name: "industry",       label: "Industry or niche",            type: "text",     required: false, placeholder: "e.g. Fitness, SaaS, Hospitality" },
      { name: "targetAudience", label: "Target audience",              type: "textarea", required: false, placeholder: "Who are your typical customers?" },
      { name: "stylePreference",label: "Style preference",             type: "text",     required: false, placeholder: "Modern, minimal, bold, playful…" },
      { name: "colorPreference",label: "Color preferences / avoids",   type: "text",     required: false, placeholder: "e.g. Blues and greens, no red" },
      { name: "deadline",       label: "Preferred delivery date",      type: "date",     required: false },
    ];
  }

  if (tags.includes("photo")) {
    return [
      { name: "subjectType",          label: "What are we shooting?",       type: "text",     required: true,  placeholder: "e.g. Skincare products, apparel" },
      { name: "quantity",             label: "Number of items / subjects",  type: "number",   required: false, placeholder: "e.g. 5" },
      { name: "location",             label: "Location preference",         type: "select",   required: false, options: ["Studio", "On-site", "Flexible"] },
      { name: "shootDate",            label: "Preferred shoot date",        type: "date",     required: false },
      { name: "specialRequirements",  label: "Special requirements",        type: "textarea", required: false, placeholder: "Props, lifestyle setups, white background…" },
    ];
  }

  if (tags.includes("web")) {
    return [
      { name: "websiteGoal",    label: "Goal of the site",              type: "textarea", required: true,  placeholder: "What should visitors do? Buy, book, learn about you…" },
      { name: "existingUrl",    label: "Existing website URL",          type: "text",     required: false, placeholder: "https://yoursite.com (leave blank if none)" },
      { name: "techPreference", label: "Tech or platform preference",   type: "text",     required: false, placeholder: "e.g. React, Webflow, WordPress, no preference" },
      { name: "copyReady",      label: "Is copy / content ready?",      type: "select",   required: false, options: ["Yes", "No", "Partially"] },
      { name: "deadline",       label: "Target launch date",            type: "date",     required: false },
    ];
  }

  // Generic fallback
  return [
    { name: "projectName",  label: "Project name",        type: "text",     required: true,  placeholder: "Give your project a name" },
    { name: "projectBrief", label: "Project brief",       type: "textarea", required: true,  placeholder: "Describe what you need…" },
    { name: "preferredDate",label: "Preferred start date",type: "date",     required: false },
  ];
}

function BookingFormPanel({ service, tier, onCancel }) {
  const navigate = useNavigate();
  const fields = getFields(service.tags || []);

  const [form, setForm] = useState(() =>
    Object.fromEntries([...fields.map((f) => [f.name, ""]), ["notes", ""]])
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/booking-checkout", {
      state: { service, tier, formData: form },
    });
  }

  return (
    <div className="booking-form-panel">
      <div className="booking-form-header">
        <h3 className="booking-form-title">
          Book{" "}
          <span className={`accent-text accent-${service.accent}`}>{tier.name}</span>
          <span className="booking-form-price"> — {tier.price}</span>
        </h3>
        <button
          type="button"
          className="booking-form-close"
          onClick={onCancel}
          aria-label="Cancel booking form"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="booking-form" noValidate={false}>
        {fields.map((field) => (
          <div key={field.name} className="booking-field">
            <label htmlFor={`bf-${field.name}`} className="booking-label">
              {field.label}
              {field.required && <span className="booking-required"> *</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={`bf-${field.name}`}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
                className="booking-input"
              />
            ) : field.type === "select" ? (
              <select
                id={`bf-${field.name}`}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required}
                className="booking-input"
              >
                <option value="">Select…</option>
                {field.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`bf-${field.name}`}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="booking-input"
              />
            )}
          </div>
        ))}

        <div className="booking-field">
          <label htmlFor="bf-notes" className="booking-label">
            Additional notes
          </label>
          <textarea
            id="bf-notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Anything else we should know?"
            rows={3}
            className="booking-input"
          />
        </div>

        <div className="booking-actions">
          <button type="button" className="cta ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="cta">
            Continue to checkout →
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingFormPanel;
