const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get platform stats
exports.getPlatformStats = async (req, res) => {
  try {
    const stats = await prisma.platformStats.findFirst();
    
    if (!stats) {
      return res.status(404).json({ error: 'Platform stats not found' });
    }
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update platform stats (admin only in real app)
exports.updatePlatformStats = async (req, res) => {
  try {
    const { 
      activeInvestors, 
      totalInvested, 
      projectedRevenue, 
      operationalCosts, 
      availableProperties 
    } = req.body;
    
    // Find existing stats
    const existingStats = await prisma.platformStats.findFirst();
    
    let stats;
    
    if (existingStats) {
      // Update existing stats
      stats = await prisma.platformStats.update({
        where: { id: existingStats.id },
        data: {
          activeInvestors,
          totalInvested,
          projectedRevenue,
          operationalCosts,
          availableProperties,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new stats if none exist
      stats = await prisma.platformStats.create({
        data: {
          activeInvestors,
          totalInvested,
          projectedRevenue,
          operationalCosts,
          availableProperties
        }
      });
    }
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate platform metrics
exports.calculatePlatformMetrics = async (req, res) => {
  try {
    // Count active investors (users with at least one investment)
    const investorsCount = await prisma.user.count({
      where: {
        investments: {
          some: {}
        }
      }
    });
    
    // Calculate total invested amount
    const investments = await prisma.investment.findMany();
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Count available properties
    const availablePropertiesCount = await prisma.property.count({
      where: {
        status: 'Available'
      }
    });
    
    // Calculate projected revenue (simplified for demo)
    const properties = await prisma.property.findMany();
    const totalMonthlyRent = properties.reduce((sum, prop) => sum + prop.monthlyRent, 0);
    const projectedAnnualRevenue = totalMonthlyRent * 12;
    
    // Estimate operational costs (simplified for demo)
    const operationalCosts = projectedAnnualRevenue * 0.3; // Assume 30% of revenue goes to costs
    
    const metrics = {
      activeInvestors: investorsCount,
      totalInvested,
      projectedRevenue: projectedAnnualRevenue,
      operationalCosts,
      availableProperties: availablePropertiesCount,
      updatedAt: new Date()
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
