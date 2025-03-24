const { Wallet, User, Property, Transaction } = require('../models');
const { ethers } = require('ethers');

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wallet = await Wallet.findOne({ where: { userId } });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // In a real app, we would connect to the blockchain to get the actual balance
    // For now, we'll return the mock balance from the database
    
    res.status(200).json({ 
      balance: wallet.balance,
      walletAddress: wallet.address
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Server error while fetching wallet balance' });
  }
};

// Get property tokens
exports.getPropertyTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's property tokens
    const transactions = await Transaction.findAll({
      where: { 
        userId,
        type: 'Purchase'
      },
      include: [
        {
          model: Property,
          attributes: ['id', 'name', 'tokenSymbol', 'currentValue']
        }
      ]
    });
    
    // Group transactions by property and calculate token amounts
    const propertyTokens = [];
    const propertyMap = new Map();
    
    transactions.forEach(transaction => {
      const propertyId = transaction.Property.id;
      
      if (propertyMap.has(propertyId)) {
        const existingToken = propertyMap.get(propertyId);
        existingToken.amount += transaction.tokenAmount;
        existingToken.totalValue += transaction.amount;
      } else {
        const newToken = {
          id: `PT${propertyId.toString().padStart(3, '0')}`,
          name: transaction.Property.name,
          tokenSymbol: transaction.Property.tokenSymbol,
          amount: transaction.tokenAmount,
          valuePerToken: transaction.amount / transaction.tokenAmount,
          totalValue: transaction.amount
        };
        propertyMap.set(propertyId, newToken);
        propertyTokens.push(newToken);
      }
    });
    
    res.status(200).json({ propertyTokens });
  } catch (error) {
    console.error('Error fetching property tokens:', error);
    res.status(500).json({ message: 'Server error while fetching property tokens' });
  }
};

// Get wallet transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wallet = await Wallet.findOne({ where: { userId } });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Get blockchain transactions
    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        {
          model: Property,
          attributes: ['tokenSymbol']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Format transactions for the frontend
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.createdAt,
      type: transaction.type,
      token: transaction.Property.tokenSymbol,
      amount: transaction.tokenAmount,
      value: transaction.amount,
      hash: transaction.transactionHash
    }));
    
    res.status(200).json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ message: 'Server error while fetching wallet transactions' });
  }
};

// Connect wallet
exports.connectWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletAddress } = req.body;
    
    // Validate wallet address
    if (!ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ message: 'Invalid wallet address' });
    }
    
    // Check if wallet already exists for this user
    let wallet = await Wallet.findOne({ where: { userId } });
    
    if (wallet) {
      // Update existing wallet
      wallet.address = walletAddress;
      await wallet.save();
    } else {
      // Create new wallet
      wallet = await Wallet.create({
        userId,
        address: walletAddress,
        balance: 2.45 // Mock initial balance
      });
    }
    
    res.status(200).json({
      message: 'Wallet connected successfully',
      wallet: {
        address: wallet.address,
        balance: wallet.balance
      }
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ message: 'Server error while connecting wallet' });
  }
};

// Purchase tokens
exports.purchaseTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId, tokenAmount, ethAmount } = req.body;
    
    // Validate inputs
    if (!propertyId || !tokenAmount || !ethAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if property exists
    const property = await Property.findByPk(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if enough tokens are available
    if (property.availableTokens < tokenAmount) {
      return res.status(400).json({ message: 'Not enough tokens available' });
    }
    
    // Get user's wallet
    const wallet = await Wallet.findOne({ where: { userId } });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Check if wallet has enough balance
    if (wallet.balance < ethAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // In a real app, we would interact with the blockchain here
    // For now, we'll update the database directly
    
    // Update wallet balance
    wallet.balance -= ethAmount;
    await wallet.save();
    
    // Update property available tokens
    property.availableTokens -= tokenAmount;
    await property.save();
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      propertyId,
      type: 'Purchase',
      tokenAmount,
      amount: ethAmount * 1000, // Convert ETH to USD for simplicity
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Generate mock transaction hash
    });
    
    res.status(200).json({
      message: 'Tokens purchased successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        tokenAmount: transaction.tokenAmount,
        amount: transaction.amount,
        transactionHash: transaction.transactionHash
      }
    });
  } catch (error) {
    console.error('Error purchasing tokens:', error);
    res.status(500).json({ message: 'Server error while purchasing tokens' });
  }
};
