const { Property, User, Transaction } = require('../models');

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(200).json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Server error while fetching properties' });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Transaction
        }
      ]
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(200).json({ property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Server error while fetching property' });
  }
};

// Create new property
exports.createProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      location, 
      description, 
      price, 
      size, 
      bedrooms, 
      bathrooms, 
      propertyType,
      tokenSymbol,
      totalTokens
    } = req.body;
    
    const property = await Property.create({
      name,
      location,
      description,
      price,
      size,
      bedrooms,
      bathrooms,
      propertyType,
      tokenSymbol,
      totalTokens,
      availableTokens: totalTokens,
      currentValue: price,
      userId
    });
    
    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Server error while creating property' });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      name, 
      location, 
      description, 
      price, 
      size, 
      bedrooms, 
      bathrooms, 
      propertyType,
      currentValue
    } = req.body;
    
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is authorized to update this property
    if (property.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }
    
    // Update property fields
    if (name) property.name = name;
    if (location) property.location = location;
    if (description) property.description = description;
    if (price) property.price = price;
    if (size) property.size = size;
    if (bedrooms) property.bedrooms = bedrooms;
    if (bathrooms) property.bathrooms = bathrooms;
    if (propertyType) property.propertyType = propertyType;
    if (currentValue) property.currentValue = currentValue;
    
    await property.save();
    
    res.status(200).json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Server error while updating property' });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is authorized to delete this property
    if (property.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }
    
    await property.destroy();
    
    res.status(200).json({
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Server error while deleting property' });
  }
};

// Get platform metrics
exports.getPlatformMetrics = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.count();
    
    // Count total properties
    const totalProperties = await Property.count();
    
    // Calculate total investment
    const properties = await Property.findAll();
    let totalInvestment = 0;
    properties.forEach(property => {
      totalInvestment += property.price;
    });
    
    // Calculate average property value
    const averagePropertyValue = totalInvestment / (totalProperties || 1);
    
    // Get property types distribution
    const residentialCount = await Property.count({ where: { propertyType: 'Residential' } });
    const commercialCount = await Property.count({ where: { propertyType: 'Commercial' } });
    const industrialCount = await Property.count({ where: { propertyType: 'Industrial' } });
    const landCount = await Property.count({ where: { propertyType: 'Land' } });
    
    const propertyTypes = [
      { type: 'Residential', percentage: Math.round((residentialCount / totalProperties) * 100) || 0 },
      { type: 'Commercial', percentage: Math.round((commercialCount / totalProperties) * 100) || 0 },
      { type: 'Industrial', percentage: Math.round((industrialCount / totalProperties) * 100) || 0 },
      { type: 'Land', percentage: Math.round((landCount / totalProperties) * 100) || 0 }
    ];
    
    // Get recent properties
    const recentProperties = await Property.findAll({
      order: [['createdAt', 'DESC']],
      limit: 3,
      include: [
        {
          model: Transaction,
          attributes: ['id', 'type', 'amount']
        }
      ]
    });
    
    // Format recent properties data
    const formattedRecentProperties = recentProperties.map(property => {
      const totalInvestors = new Set(property.Transactions.map(t => t.userId)).size;
      const totalInvestment = property.Transactions.reduce((sum, t) => t.type === 'Purchase' ? sum + t.amount : sum, 0);
      const fundingPercentage = Math.min(100, Math.round((totalInvestment / property.price) * 100));
      
      return {
        id: property.id,
        name: property.name,
        location: property.location,
        value: property.price,
        investors: totalInvestors,
        fundingComplete: fundingPercentage
      };
    });
    
    // Calculate monthly investments (mock data for now)
    const monthlyInvestments = [
      { month: 'Jan', amount: 2100000 },
      { month: 'Feb', amount: 2300000 },
      { month: 'Mar', amount: 2500000 },
      { month: 'Apr', amount: 2400000 },
      { month: 'May', amount: 2700000 },
      { month: 'Jun', amount: 3100000 }
    ];
    
    res.status(200).json({
      totalUsers,
      totalProperties,
      totalInvestment,
      averagePropertyValue,
      propertyTypes,
      recentProperties: formattedRecentProperties,
      monthlyInvestments,
      monthlyGrowth: 8.5 // Mock data for now
    });
  } catch (error) {
    console.error('Error fetching platform metrics:', error);
    res.status(500).json({ message: 'Server error while fetching platform metrics' });
  }
};
