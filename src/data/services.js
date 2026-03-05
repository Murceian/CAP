const services = [
  {
    id: "s1",
    title: "Brand Starter",
    subtitle: "Logo + palette + type",
    priceLabel: "From $220",
    meta: ["2 rounds", "1 week"],
    tags: ["design"],
    accent: "amber",
    tiers: {
      basic: {
        name: "Basic",
        price: "$220",
        features: ["Logo (1 concept)", "Color palette", "2 revision rounds"],
      },
      standard: {
        name: "Standard",
        price: "$380",
        features: [
          "Logo (2 concepts)",
          "Palette + type system",
          "Brand guidelines PDF",
          "3 revision rounds",
        ],
      },
      premium: {
        name: "Premium",
        price: "$620",
        features: [
          "Logo (3 concepts)",
          "Full brand system",
          "Business card design",
          "Social kit",
          "Unlimited revisions",
        ],
      },
    },
  },
  {
    id: "s2",
    title: "Product Photos",
    subtitle: "Lifestyle + clean pack",
    priceLabel: "From $180",
    meta: ["Studio", "15 edits"],
    tags: ["photo"],
    accent: "sky",
    tiers: {
      basic: {
        name: "Basic",
        price: "$180",
        features: ["10 final images", "1 scene setup", "Standard retouching"],
      },
      standard: {
        name: "Standard",
        price: "$320",
        features: [
          "25 final images",
          "2 scene setups",
          "Lifestyle + clean white",
          "Advanced retouching",
        ],
      },
      premium: {
        name: "Premium",
        price: "$520",
        features: [
          "50 final images",
          "4 scene setups",
          "Lifestyle + detail + white",
          "Video clip (15 sec)",
          "Same-day turnaround",
        ],
      },
    },
  },
  {
    id: "s3",
    title: "Landing Page",
    subtitle: "One-page site",
    priceLabel: "From $320",
    meta: ["Responsive", "2 weeks"],
    tags: ["web"],
    accent: "peach",
    tiers: {
      basic: {
        name: "Basic",
        price: "$320",
        features: ["Single page", "Mobile responsive", "Contact form", "1 revision round"],
      },
      standard: {
        name: "Standard",
        price: "$540",
        features: [
          "Up to 3 sections",
          "Mobile responsive",
          "Contact form + CTA",
          "Basic SEO setup",
          "2 revision rounds",
        ],
      },
      premium: {
        name: "Premium",
        price: "$860",
        features: [
          "Full landing page",
          "Animation + interactions",
          "Analytics integration",
          "Performance optimized",
          "Unlimited revisions",
        ],
      },
    },
  },
];

export default services;
