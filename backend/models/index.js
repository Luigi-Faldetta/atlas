const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// Property Model
const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER
  },
  bedrooms: {
    type: DataTypes.INTEGER
  },
  bathrooms: {
    type: DataTypes.INTEGER
  },
  propertyType: {
    type: DataTypes.ENUM('Residential', 'Commercial', 'Industrial', 'Land'),
    allowNull: false
  },
  tokenSymbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  availableTokens: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// Wallet Model
const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(12, 6),
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// Transaction Model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('Purchase', 'Sale', 'Dividend'),
    allowNull: false
  },
  tokenAmount: {
    type: DataTypes.DECIMAL(12, 6),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  transactionHash: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// PropertyAnalysis Model
const PropertyAnalysis = sequelize.define('PropertyAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  propertyUrl: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  results: {
    type: DataTypes.JSON
  },
  error: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// Define relationships
User.hasMany(Property);
Property.belongsTo(User);

User.hasOne(Wallet);
Wallet.belongsTo(User);

User.hasMany(Transaction);
Transaction.belongsTo(User);

Property.hasMany(Transaction);
Transaction.belongsTo(Property);

User.hasMany(PropertyAnalysis);
PropertyAnalysis.belongsTo(User);

module.exports = {
  User,
  Property,
  Wallet,
  Transaction,
  PropertyAnalysis,
  sequelize
};
