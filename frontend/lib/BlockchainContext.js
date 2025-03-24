'use client';

import { ethers } from 'ethers';
import { useState, useEffect, createContext, useContext } from 'react';
import { BlockchainContextType } from '@/types/blockchain';

/**
 * @typedef {Object} Token
 * @property {string} id
 * @property {string} name
 * @property {number} balance
 */

/**
 * @typedef {Object} BlockchainContextType
 * @property {string | null} account
 * @property {boolean} isConnected
 * @property {() => Promise<void>} connectWallet
 * @property {(account: string) => Promise<Token[]>} getUserTokens
 * @property {string | null} error
 */

/** @type {React.Context<BlockchainContextType | null>} */
const BlockchainContext = createContext(null);

/**
 * Hook to use the blockchain context
 * @returns {BlockchainContextType}
 */

// Mock ERC-721 ABI (simplified for demo purposes)
const mockERC721ABI = [
  // Read-only functions
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  // Transactions
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
];

// Provider component
export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Mock contract addresses
  const mockTokenAddress = '0x1234567890abcdef1234567890abcdef12345678';

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          // Create a provider instance
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              updateConnectionStatus(provider);
            } else {
              setAccount(null);
              setIsConnected(false);
            }
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });

          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setSigner(provider.getSigner());
            updateConnectionStatus(provider);
          }
        } else {
          setError(
            'MetaMask is not installed. Please install MetaMask to use blockchain features.'
          );
        }
      } catch (err) {
        console.error('Error initializing blockchain provider:', err);
        setError('Failed to initialize blockchain connection.');
      }
    };

    initProvider();

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Update connection status
  const updateConnectionStatus = async (provider) => {
    try {
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      setSigner(provider.getSigner());
      setIsConnected(true);
    } catch (err) {
      console.error('Error updating connection status:', err);
      setIsConnected(false);
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      setError(null);

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setSigner(provider.getSigner());
        await updateConnectionStatus(provider);
        return accounts[0];
      } else {
        throw new Error('No accounts found');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    }
  };

  // Disconnect wallet (for UI purposes only, doesn't actually disconnect MetaMask)
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
  };

  // Get token contract instance
  const getTokenContract = (address = mockTokenAddress) => {
    if (!provider) return null;

    try {
      return new ethers.Contract(address, mockERC721ABI, signer || provider);
    } catch (err) {
      console.error('Error getting token contract:', err);
      return null;
    }
  };

  // Get token details
  const getTokenDetails = async (tokenId, address = mockTokenAddress) => {
    try {
      const contract = getTokenContract(address);
      if (!contract) throw new Error('Contract not initialized');

      // In a real app, this would fetch actual token data from the blockchain
      // For demo purposes, we'll return mock data
      return {
        tokenId,
        owner: account,
        tokenURI: `https://atlas.example.com/token/${tokenId}`,
        name: 'Atlas Property Token',
        symbol: 'APT',
      };
    } catch (err) {
      console.error('Error getting token details:', err);
      return null;
    }
  };

  // Get user's tokens
  const getUserTokens = async (userAddress = account) => {
    try {
      if (!userAddress) throw new Error('No user address provided');

      // In a real app, this would query the blockchain for tokens owned by the user
      // For demo purposes, we'll return mock data
      return [
        {
          tokenId: 'TOKEN-001',
          propertyId: 'prop-001',
          propertyTitle: 'Luxury Apartment Complex',
          location: 'New York, NY',
          totalValue: 5000000,
          investedAmount: 250000,
          percentage: 5,
          monthlyEarnings: 1250,
          tokenAddress: mockTokenAddress,
        },
        {
          tokenId: 'TOKEN-002',
          propertyId: 'prop-003',
          propertyTitle: 'Suburban Housing Development',
          location: 'Austin, TX',
          totalValue: 8500000,
          investedAmount: 425000,
          percentage: 5,
          monthlyEarnings: 2125,
          tokenAddress: mockTokenAddress,
        },
      ];
    } catch (err) {
      console.error('Error getting user tokens:', err);
      return [];
    }
  };

  // Create a new token (mock implementation)
  const createToken = async (propertyId, amount, percentage) => {
    try {
      if (!isConnected) throw new Error('Wallet not connected');

      // In a real app, this would mint a new token on the blockchain
      // For demo purposes, we'll return mock data
      const tokenId = `TOKEN-${Date.now()}`;

      return {
        tokenId,
        propertyId,
        amount,
        percentage,
        owner: account,
        tokenAddress: mockTokenAddress,
        transactionHash: `0x${Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`,
      };
    } catch (err) {
      console.error('Error creating token:', err);
      throw err;
    }
  };

  // Context value
  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    getTokenContract,
    getTokenDetails,
    getUserTokens,
    createToken,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Hook to use the blockchain context
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
