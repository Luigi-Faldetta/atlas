const { User, Transaction, Property } = require('../models');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get user dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's properties and investments
    const userProperties = await Property.findAll({
      where: { userId },
      include: [
        {
          model: Transaction,
          where: { userId }
        }
      ]
    });
    
    // Calculate portfolio metrics
    let totalInvestment = 0;
    let portfolioValue = 0;
    
    userProperties.forEach(property => {
      // Sum up investment amounts
      property.Transactions.forEach(transaction => {
        if (transaction.type === 'Purchase') {
          totalInvestment += transaction.amount;
        }
      });
      
      // Calculate current value
      portfolioValue += property.currentValue;
    });
    
    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: Property,
          attributes: ['name']
        }
      ]
    });
    
    res.status(200).json({
      totalInvestment,
      portfolioValue,
      properties: userProperties,
      transactions: recentTransactions
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};

// Get user transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Property,
          attributes: ['name']
        }
      ]
    });
    
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};
