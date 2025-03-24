const users = [
  {
    id: "user-001",
    email: "john.doe@example.com",
    password: "$2b$10$XFDQMmvJ9PUHPbpBOb3Yp.xxxx", // hashed version of "password123"
    name: "John Doe",
    createdAt: new Date(),
    updatedAt: new Date(),
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12"
  },
  {
    id: "user-002",
    email: "jane.smith@example.com",
    password: "$2b$10$XFDQMmvJ9PUHPbpBOb3Yp.xxxx", // hashed version of "password123"
    name: "Jane Smith",
    createdAt: new Date(),
    updatedAt: new Date(),
    walletAddress: "0xbcdef1234567890abcdef1234567890abcdef123"
  },
  {
    id: "user-003",
    email: "michael.johnson@example.com",
    password: "$2b$10$XFDQMmvJ9PUHPbpBOb3Yp.xxxx", // hashed version of "password123"
    name: "Michael Johnson",
    createdAt: new Date(),
    updatedAt: new Date(),
    walletAddress: "0xcdef1234567890abcdef1234567890abcdef1234"
  }
];

module.exports = users;
