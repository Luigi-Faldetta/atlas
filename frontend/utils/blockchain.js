import { ethers } from 'ethers';

// ABI for the ERC-20 token contract
const tokenABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  
  // Authenticated functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// ABI for the property token contract
const propertyTokenABI = [
  // Read-only functions
  "function getPropertyDetails() view returns (string name, string location, uint256 totalValue, uint256 totalTokens)",
  "function getTokenPrice() view returns (uint256)",
  "function getAvailableTokens() view returns (uint256)",
  
  // Authenticated functions
  "function purchaseTokens(uint256 amount) payable returns (bool)",
  "function claimDividends() returns (uint256)",
  
  // Events
  "event TokensPurchased(address indexed buyer, uint256 amount, uint256 value)",
  "event DividendsClaimed(address indexed owner, uint256 amount)"
];

// Connect to Ethereum provider
export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install it to use this feature.");
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = accounts[0];
    
    // Get network information
    const network = await provider.getNetwork();
    
    return {
      provider,
      signer,
      address,
      network
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// Get wallet balance
export const getWalletBalance = async (address) => {
  try {
    const { provider } = await connectWallet();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    throw error;
  }
};

// Get property token details
export const getPropertyTokenDetails = async (tokenAddress) => {
  try {
    const { signer } = await connectWallet();
    const tokenContract = new ethers.Contract(tokenAddress, propertyTokenABI, signer);
    
    const details = await tokenContract.getPropertyDetails();
    const tokenPrice = await tokenContract.getTokenPrice();
    const availableTokens = await tokenContract.getAvailableTokens();
    
    return {
      name: details.name,
      location: details.location,
      totalValue: ethers.utils.formatEther(details.totalValue),
      totalTokens: details.totalTokens.toString(),
      tokenPrice: ethers.utils.formatEther(tokenPrice),
      availableTokens: availableTokens.toString()
    };
  } catch (error) {
    console.error("Error getting property token details:", error);
    throw error;
  }
};

// Purchase property tokens
export const purchasePropertyTokens = async (tokenAddress, amount, value) => {
  try {
    const { signer } = await connectWallet();
    const tokenContract = new ethers.Contract(tokenAddress, propertyTokenABI, signer);
    
    // Convert amount to wei
    const weiValue = ethers.utils.parseEther(value.toString());
    
    // Purchase tokens
    const tx = await tokenContract.purchaseTokens(amount, { value: weiValue });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.transactionHash,
      success: true
    };
  } catch (error) {
    console.error("Error purchasing property tokens:", error);
    throw error;
  }
};

// Claim dividends
export const claimDividends = async (tokenAddress) => {
  try {
    const { signer } = await connectWallet();
    const tokenContract = new ethers.Contract(tokenAddress, propertyTokenABI, signer);
    
    // Claim dividends
    const tx = await tokenContract.claimDividends();
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Get amount claimed from event
    const event = receipt.events.find(e => e.event === 'DividendsClaimed');
    const amount = event.args.amount;
    
    return {
      transactionHash: receipt.transactionHash,
      amount: ethers.utils.formatEther(amount),
      success: true
    };
  } catch (error) {
    console.error("Error claiming dividends:", error);
    throw error;
  }
};

// Listen for MetaMask account changes
export const setupAccountChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0]);
    });
  }
};

// Listen for MetaMask network changes
export const setupNetworkChangeListener = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(parseInt(chainId, 16));
    });
  }
};

export default {
  connectWallet,
  getWalletBalance,
  getPropertyTokenDetails,
  purchasePropertyTokens,
  claimDividends,
  setupAccountChangeListener,
  setupNetworkChangeListener
};
