const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all investments for a user
exports.getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const investments = await prisma.investment.findMany({
      where: { userId },
      include: { property: true }
    });
    
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new investment
exports.createInvestment = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    const userId = req.user.id;
    
    // Get property
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Calculate percentage of ownership
    const percentage = (amount / property.totalValue) * 100;
    
    // Create investment
    const investment = await prisma.investment.create({
      data: {
        userId,
        propertyId,
        amount,
        percentage,
        // Mock tokenId for now
        tokenId: `TOKEN-${Date.now()}`
      }
    });
    
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get investment by ID
exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        userId // Ensure user can only access their own investments
      },
      include: { property: true }
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.status(200).json(investment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate projected returns for an investment
exports.calculateProjectedReturns = async (req, res) => {
  try {
    const { propertyId, amount, years = 10 } = req.body;
    
    // Get property
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Calculate ownership percentage
    const percentage = (amount / property.totalValue) * 100;
    
    // Calculate monthly income
    const monthlyIncome = (property.monthlyRent * percentage) / 100;
    const annualIncome = monthlyIncome * 12;
    
    // Calculate projected returns for each year
    const projections = [];
    let cumulativeReturn = 0;
    
    for (let year = 1; year <= years; year++) {
      // Apply annual appreciation to the property value
      const appreciatedValue = amount * Math.pow(1 + (property.annualAppreciation / 100), year);
      
      // Calculate annual rental income (assuming it grows with property value)
      const yearlyRentalIncome = annualIncome * Math.pow(1 + (property.annualAppreciation / 100), year - 1);
      
      cumulativeReturn += yearlyRentalIncome;
      
      projections.push({
        year,
        propertyValue: appreciatedValue,
        annualRentalIncome: yearlyRentalIncome,
        cumulativeRentalIncome: cumulativeReturn,
        totalReturn: (cumulativeReturn / amount) * 100
      });
    }
    
    res.status(200).json({
      propertyId,
      investmentAmount: amount,
      ownershipPercentage: percentage,
      monthlyIncome,
      annualIncome,
      projections
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
