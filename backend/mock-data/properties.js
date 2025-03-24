const properties = [
  {
    id: "prop-001",
    title: "Luxury Apartment Complex",
    description: "A modern luxury apartment complex with 50 units in a prime downtown location. High rental demand and excellent appreciation potential.",
    location: "New York, NY",
    totalValue: 5000000,
    monthlyRent: 25000,
    annualAppreciation: 5.2,
    riskScore: 25, // Lower is less risky
    aiScore: 85, // Higher is better investment
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    status: "Available",
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678"
  },
  {
    id: "prop-002",
    title: "Commercial Office Building",
    description: "A 10-story commercial office building in the financial district with long-term corporate tenants and stable income.",
    location: "Chicago, IL",
    totalValue: 12000000,
    monthlyRent: 80000,
    annualAppreciation: 3.8,
    riskScore: 30,
    aiScore: 78,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    status: "Funding",
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenAddress: "0x2345678901abcdef2345678901abcdef23456789"
  },
  {
    id: "prop-003",
    title: "Suburban Housing Development",
    description: "A new housing development with 25 single-family homes in a growing suburban area with excellent schools and amenities.",
    location: "Austin, TX",
    totalValue: 8500000,
    monthlyRent: 42500,
    annualAppreciation: 6.5,
    riskScore: 20,
    aiScore: 92,
    imageUrl: "https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    status: "Available",
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenAddress: "0x3456789012abcdef3456789012abcdef34567890"
  },
  {
    id: "prop-004",
    title: "Retail Shopping Center",
    description: "A well-established retail shopping center with national anchor tenants and strong foot traffic in a densely populated area.",
    location: "Los Angeles, CA",
    totalValue: 15000000,
    monthlyRent: 95000,
    annualAppreciation: 4.2,
    riskScore: 35,
    aiScore: 75,
    imageUrl: "https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    status: "Funded",
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenAddress: "0x4567890123abcdef4567890123abcdef45678901"
  },
  {
    id: "prop-005",
    title: "Vacation Rental Portfolio",
    description: "A portfolio of 15 vacation rental properties in a popular tourist destination with high seasonal demand and strong returns.",
    location: "Miami, FL",
    totalValue: 7500000,
    monthlyRent: 60000,
    annualAppreciation: 5.8,
    riskScore: 40,
    aiScore: 82,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    status: "Available",
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenAddress: "0x5678901234abcdef5678901234abcdef56789012"
  }
];

module.exports = properties;
