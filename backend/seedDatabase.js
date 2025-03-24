const seedDatabase = async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const bcrypt = require('bcrypt');
  
  const properties = require('./mock-data/properties');
  const users = require('./mock-data/users');
  const investments = require('./mock-data/investments');
  const platformStats = require('./mock-data/platformStats');
  
  try {
    console.log('Seeding database with mock data...');
    
    // Clear existing data
    await prisma.investment.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.platformStats.deleteMany({});
    
    console.log('Creating users...');
    // Hash passwords properly for users
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: hashedPassword,
          name: user.name,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    
    console.log('Creating properties...');
    for (const property of properties) {
      await prisma.property.create({
        data: {
          id: property.id,
          title: property.title,
          description: property.description,
          location: property.location,
          totalValue: property.totalValue,
          monthlyRent: property.monthlyRent,
          annualAppreciation: property.annualAppreciation,
          riskScore: property.riskScore,
          aiScore: property.aiScore,
          imageUrl: property.imageUrl,
          status: property.status,
          tokenAddress: property.tokenAddress,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        }
      });
    }
    
    console.log('Creating investments...');
    for (const investment of investments) {
      await prisma.investment.create({
        data: {
          id: investment.id,
          userId: investment.userId,
          propertyId: investment.propertyId,
          amount: investment.amount,
          percentage: investment.percentage,
          tokenId: investment.tokenId,
          createdAt: investment.createdAt,
          updatedAt: investment.updatedAt
        }
      });
    }
    
    console.log('Creating platform stats...');
    await prisma.platformStats.create({
      data: {
        id: platformStats.id,
        activeInvestors: platformStats.activeInvestors,
        totalInvested: platformStats.totalInvested,
        projectedRevenue: platformStats.projectedRevenue,
        operationalCosts: platformStats.operationalCosts,
        availableProperties: platformStats.availableProperties,
        updatedAt: platformStats.updatedAt
      }
    });
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = seedDatabase;
