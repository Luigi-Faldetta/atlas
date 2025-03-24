const sequelize = require('./database');
const { User, Property, Wallet, Transaction, PropertyAnalysis } = require('../models');

// Database initialization function
const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');

    // Check if we need to seed initial data
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('Seeding initial data...');
      await seedInitialData();
      console.log('Initial data seeded successfully.');
    }

    return true;
  } catch (error) {
    console.error('Unable to initialize database:', error);
    return false;
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@projectatlas.com',
      password: '$2b$10$XFE0pOzpFQmFDDGrpJVhz.lNZ1gw9HMJbMVRg5Kxo.5/bqLIQW2Sq' // hashed 'password123'
    });

    // Create demo user
    const demoUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '$2b$10$XFE0pOzpFQmFDDGrpJVhz.lNZ1gw9HMJbMVRg5Kxo.5/bqLIQW2Sq' // hashed 'password123'
    });

    // Create wallet for demo user
    const wallet = await Wallet.create({
      userId: demoUser.id,
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      balance: 2.45
    });

    // Create sample properties
    const property1 = await Property.create({
      name: 'Luxury Condo - Downtown',
      location: 'New York, NY',
      description: 'Luxurious condo in the heart of downtown with stunning city views.',
      price: 1000000,
      size: 1200,
      bedrooms: 2,
      bathrooms: 2,
      propertyType: 'Residential',
      tokenSymbol: 'LCDNY',
      totalTokens: 1000,
      availableTokens: 950,
      currentValue: 1150000,
      userId: adminUser.id
    });

    const property2 = await Property.create({
      name: 'Beachfront Villa',
      location: 'Miami, FL',
      description: 'Beautiful beachfront villa with direct access to the ocean.',
      price: 2000000,
      size: 3500,
      bedrooms: 4,
      bathrooms: 3,
      propertyType: 'Residential',
      tokenSymbol: 'BFVMI',
      totalTokens: 2000,
      availableTokens: 1925,
      currentValue: 2200000,
      userId: adminUser.id
    });

    // Create sample transactions
    await Transaction.create({
      userId: demoUser.id,
      propertyId: property1.id,
      type: 'Purchase',
      tokenAmount: 50,
      amount: 50000,
      transactionHash: '0x8a7d953d3a5803c6273ffd7d42c458432cb28e9b5ef9e4522a8b2d9e833814ab'
    });

    await Transaction.create({
      userId: demoUser.id,
      propertyId: property2.id,
      type: 'Purchase',
      tokenAmount: 75,
      amount: 75000,
      transactionHash: '0x3a9d953d3a5803c6273ffd7d42c458432cb28e9b5ef9e4522a8b2d9e833814cd'
    });

    await Transaction.create({
      userId: demoUser.id,
      propertyId: property1.id,
      type: 'Dividend',
      tokenAmount: 0.2,
      amount: 200,
      transactionHash: '0x5b7d953d3a5803c6273ffd7d42c458432cb28e9b5ef9e4522a8b2d9e833814ef'
    });

    await Transaction.create({
      userId: demoUser.id,
      propertyId: property2.id,
      type: 'Dividend',
      tokenAmount: 0.325,
      amount: 325,
      transactionHash: '0x2c7d953d3a5803c6273ffd7d42c458432cb28e9b5ef9e4522a8b2d9e833814ba'
    });

  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
