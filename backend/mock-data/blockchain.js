const { ethers } = require('ethers');

// Mock ERC-721 ABI (simplified for demo purposes)
const mockERC721ABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  // Transactions
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)"
];

// Mock token contract address
const mockTokenAddress = "0x1234567890abcdef1234567890abcdef12345678";

// Function to create a mock blockchain connection
const createMockBlockchainConnection = () => {
  // This would be a real provider in production
  // For demo, we'll just return a mock object
  return {
    getNetwork: async () => ({ chainId: 1, name: 'Ethereum Mainnet' }),
    getSigner: () => ({
      getAddress: async () => "0xabcdef1234567890abcdef1234567890abcdef12",
      signMessage: async (message) => `0x${Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    }),
    listAccounts: async () => ["0xabcdef1234567890abcdef1234567890abcdef12"]
  };
};

// Function to create a mock token contract
const createMockTokenContract = () => {
  return {
    balanceOf: async (address) => ethers.BigNumber.from(2),
    ownerOf: async (tokenId) => "0xabcdef1234567890abcdef1234567890abcdef12",
    tokenURI: async (tokenId) => `https://atlas.example.com/token/${tokenId}`,
    name: async () => "Atlas Property Token",
    symbol: async () => "APT",
    transferFrom: async (from, to, tokenId) => ({
      hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      wait: async () => ({ status: 1 })
    }),
    approve: async (to, tokenId) => ({
      hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      wait: async () => ({ status: 1 })
    })
  };
};

module.exports = {
  mockERC721ABI,
  mockTokenAddress,
  createMockBlockchainConnection,
  createMockTokenContract
};
