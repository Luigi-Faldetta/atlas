# InvestmentAnalysis Component Documentation

## Overview

The InvestmentAnalysis component is a comprehensive property investment analysis dashboard that presents detailed property information, financial metrics, and location-based data in a user-friendly interface. The component has been designed to seamlessly integrate with backend data while providing a rich, informative user experience.

![InvestmentAnalysis Screenshot](https://example.com/screenshot.png)

## Table of Contents

- [Component Structure](#component-structure)
- [Data Structure](#data-structure)
- [Backend Integration Guide](#backend-integration-guide)
- [UI Sections](#ui-sections)
- [Advanced Features](#advanced-features)
  - [PDF Report Generation](#pdf-report-generation)
  - [Watchlist Integration](#watchlist-integration)
  - [Issue Reporting System](#issue-reporting-system)
- [Future Enhancements](#future-enhancements)

## Component Structure

The InvestmentAnalysis component is structured into several key sections:

1. **Action Buttons** - Download report, save to watchlist, and report issue functionality
2. **Property Details** - Basic property information and characteristics
3. **Financial Analysis** - ROI, yield, and financial projections
4. **Nearby Amenities** - Count of facilities in the vicinity
5. **Location Assessment** - Pros and cons of the location
6. **Suitability & Score** - Demographic fit and overall property score
7. **API Integration Points** - External data sources for pollution and news

Each section is designed as a modular card that can be independently populated with data from the backend.

## Data Structure

The component accepts the following props:

```typescript
type InvestmentAnalysisProps = {
  // Core property data
  investmentScore: number;
  price: string;
  address: string;
  pricePerSqm: number | null;
  
  // Financial data
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
  monthlyRentalIncome: number | null;
  expectedMonthlyIncome: number | null;
  yearlyAppreciationPercentage: number | null;
  yearlyAppreciationValue: number | null;
  annualRentalIncome?: number;
  annualExpenses?: number;
  netOperatingIncome?: number;
  breakEvenPoint?: number;
  fiveYearProjectedValue?: number;
  
  // Property specifics
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  yearBuilt?: number;
  description?: string;
  features?: string[];
  characteristics?: string[];
  
  // Analysis data
  strengths: string[];
  weaknesses: string[];
  riskScore?: number;
  yieldScore?: number;
  growthScore?: number;
  locationScore?: number;
  conditionScore?: number;
  
  // Nearby amenities data
  nearbyAmenities?: {
    schools: number;
    groceryStores: number;
    gyms: number;
    restaurants: number;
    hospitals: number;
    parks: number;
  };
  
  // Suitability data
  suitabilityScores?: {
    families: number;
    couples: number;
    singles: number;
  };
  
  // Location assessment
  locationPros?: string[];
  locationCons?: string[];
};
```

## Backend Integration Guide

To connect the InvestmentAnalysis component to your backend data, follow these steps:

### 1. API Endpoint Setup

Create a dedicated endpoint for property analysis data:

```
GET /api/properties/{propertyId}/analysis
```

This endpoint should return a JSON object with all the necessary data for the component.

### 2. Data Mapping

Map your backend data model to the frontend props structure. Here's an example of how to structure your API response:

```json
{
  "property": {
    "id": "123",
    "address": "Aragohof 4-1, 1098 RR Amsterdam",
    "price": "535000",
    "pricePerSqm": 7868,
    "bedrooms": 2,
    "bathrooms": 1,
    "size": 85,
    "yearBuilt": 2010,
    "description": "Beautiful and bright apartment located in a prime area...",
    "features": ["Elevator", "Air conditioning", "Parking", "Built-in wardrobes", "Security system", "Balcony"]
  },
  "financials": {
    "investmentScore": 75,
    "roi5Years": 18,
    "roi10Years": 42.5,
    "yearlyYield": 3.5,
    "monthlyRentalIncome": 1500,
    "expectedMonthlyIncome": 1650,
    "yearlyAppreciationPercentage": 3.2,
    "yearlyAppreciationValue": 17120,
    "annualRentalIncome": 19200,
    "annualExpenses": 5760,
    "netOperatingIncome": 13440,
    "breakEvenPoint": 23.8,
    "fiveYearProjectedValue": 380050
  },
  "analysis": {
    "strengths": [
      "Prime location with excellent amenities",
      "Strong rental demand in the area",
      "Recently renovated with modern finishes"
    ],
    "weaknesses": [
      "Higher property taxes compared to neighboring areas",
      "Limited parking options",
      "Seasonal tourism affects local traffic"
    ],
    "scores": {
      "risk": 5.4,
      "yield": 7.0,
      "growth": 7.3,
      "location": 8.6,
      "condition": 9.1
    },
    "characteristics": [
      "High Growth Area", 
      "Tourist Friendly",
      "Limited Parking",
      "Strong Rental Demand"
    ]
  },
  "location": {
    "amenities": {
      "schools": 7,
      "groceryStores": 5,
      "gyms": 3,
      "restaurants": 13,
      "hospitals": 2,
      "parks": 6
    },
    "pros": [
      "7 educational institutions nearby",
      "Good access to 5 grocery stores",
      "15 dining options in the area",
      "Air conditioning available",
      "Established neighborhood"
    ],
    "cons": [
      "Hospital congestion may cause noise",
      "Larger space may require more maintenance",
      "Tourist congestion during peak seasons",
      "Shared elevator maintenance costs"
    ],
    "suitability": {
      "families": 100,
      "couples": 100,
      "singles": 100
    }
  }
}
```

### 3. Integration in Frontend Component

In your page or container component, fetch the data and pass it to the InvestmentAnalysis component:

```tsx
import { useState, useEffect } from 'react';
import InvestmentAnalysis from '../components/InvestmentAnalysis';

const PropertyAnalysisPage = ({ propertyId }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${propertyId}/analysis`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }
        
        const data = await response.json();
        setAnalysisData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [propertyId]);

  if (loading) return <div>Loading analysis...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analysisData) return <div>No analysis data available</div>;

  return (
    <InvestmentAnalysis
      // Property data
      address={analysisData.property.address}
      price={analysisData.property.price}
      pricePerSqm={analysisData.property.pricePerSqm}
      bedrooms={analysisData.property.bedrooms}
      bathrooms={analysisData.property.bathrooms}
      size={analysisData.property.size}
      yearBuilt={analysisData.property.yearBuilt}
      description={analysisData.property.description}
      features={analysisData.property.features}
      
      // Financial data
      investmentScore={analysisData.financials.investmentScore}
      roi5Years={analysisData.financials.roi5Years}
      roi10Years={analysisData.financials.roi10Years}
      yearlyYield={analysisData.financials.yearlyYield}
      monthlyRentalIncome={analysisData.financials.monthlyRentalIncome}
      expectedMonthlyIncome={analysisData.financials.expectedMonthlyIncome}
      yearlyAppreciationPercentage={analysisData.financials.yearlyAppreciationPercentage}
      yearlyAppreciationValue={analysisData.financials.yearlyAppreciationValue}
      annualRentalIncome={analysisData.financials.annualRentalIncome}
      annualExpenses={analysisData.financials.annualExpenses}
      netOperatingIncome={analysisData.financials.netOperatingIncome}
      breakEvenPoint={analysisData.financials.breakEvenPoint}
      fiveYearProjectedValue={analysisData.financials.fiveYearProjectedValue}
      
      // Analysis data
      strengths={analysisData.analysis.strengths}
      weaknesses={analysisData.analysis.weaknesses}
      riskScore={analysisData.analysis.scores.risk}
      yieldScore={analysisData.analysis.scores.yield}
      growthScore={analysisData.analysis.scores.growth}
      locationScore={analysisData.analysis.scores.location}
      conditionScore={analysisData.analysis.scores.condition}
      characteristics={analysisData.analysis.characteristics}
      
      // Location data
      nearbyAmenities={analysisData.location.amenities}
      locationPros={analysisData.location.pros}
      locationCons={analysisData.location.cons}
      suitabilityScores={analysisData.location.suitability}
    />
  );
};

export default PropertyAnalysisPage;
```

### 4. Default Values and Fallback Handling

The InvestmentAnalysis component provides sensible defaults for many props, but it's best practice to ensure all critical data is available from your backend. For optional data, implement fallbacks in your data mapping:

```typescript
// Example of safely mapping data with fallbacks
const mapApiResponseToProps = (apiData) => {
  return {
    // Required props with fallbacks
    investmentScore: apiData.financials?.investmentScore || 0,
    price: apiData.property?.price || "0",
    address: apiData.property?.address || "Address unavailable",
    
    // Optional props that can be undefined
    pricePerSqm: apiData.property?.pricePerSqm,
    nearbyAmenities: apiData.location?.amenities,
    
    // Arrays with empty array fallbacks
    strengths: apiData.analysis?.strengths || [],
    weaknesses: apiData.analysis?.weaknesses || [],
    features: apiData.property?.features || [],
    
    // Nested optional data with structured fallbacks
    suitabilityScores: apiData.location?.suitability || {
      families: 0,
      couples: 0,
      singles: 0
    }
  };
};
```

## UI Sections

### Property Details Section

This section displays basic property information. Backend requirements:
- Property metadata (price, address, size, etc.)
- Property features list
- Property description

If you have a property image, you can add it to the response and update the component to use the provided image URL.

### Financial Analysis Section

This section presents financial metrics and projections. Backend requirements:
- Core financial metrics (yield, ROI)
- Monthly and annual financial figures
- Appreciation values and projections

The component automatically calculates projected property values based on the appreciation percentage if not provided directly.

### Nearby Amenities Section

This section displays counts of local facilities. Backend requirements:
- Counts of various amenity types within a defined radius
- Consider providing the radius as additional metadata

For more advanced implementations, you might consider providing geolocation data for each amenity to enable map visualization in future enhancements.

### Location Assessment Section

This section presents pros and cons of the location. Backend requirements:
- List of location advantages
- List of location disadvantages

Consider standardizing these lists to ensure consistent presentation.

### Suitability & Score Section

This section shows demographic fit and overall property score. Backend requirements:
- Suitability scores for different demographic groups
- Overall property investment score
- Categorical scores for different investment aspects

### External API Integration Sections

These sections provide placeholders for pollution and news data. These are designed to be connected to external APIs by the user rather than your backend.

## Advanced Features

### PDF Report Generation

The "Download Report" button is prepared for integration with a PDF generation service. Backend requirements:
- PDF generation endpoint that accepts property ID
- Route for returning generated PDF file

Example implementation:

```typescript
// Frontend handler
const handleDownloadReport = async () => {
  try {
    const response = await fetch(`/api/properties/${propertyId}/report`, {
      method: 'POST',
    });
    
    if (!response.ok) throw new Error('Failed to generate report');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analysis-${propertyId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading report:', err);
    // Handle error state
  }
};
```

### Watchlist Integration

The "Save to Watchlist" button is prepared for integration with a user watchlist feature. Backend requirements:
- User authentication system
- Watchlist storage and management endpoints

Example implementation:

```typescript
// Frontend handler
const handleSaveToWatchlist = async () => {
  try {
    const response = await fetch('/api/user/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propertyId }),
    });
    
    if (!response.ok) throw new Error('Failed to add to watchlist');
    
    // Show success notification
    setNotification({ type: 'success', message: 'Property added to watchlist' });
  } catch (err) {
    console.error('Error saving to watchlist:', err);
    // Show error notification
    setNotification({ type: 'error', message: 'Failed to add to watchlist' });
  }
};
```

### Issue Reporting System

The "Report Issue" feature allows users to submit feedback or report bugs they encounter while using the property analysis tool. This feature includes a button in the action buttons section and a modal that collects structured feedback data.

#### UI Components

1. **Report Issue Button** - Located in the top action buttons section with the following characteristics:
   - Amber/yellow color scheme to differentiate it from other actions
   - Flag icon for visual clarity
   - Opens a modal dialog when clicked

2. **Feedback Modal** - A comprehensive form that collects:
   - Property URL: The web address of the property being analyzed
   - File upload: Allows users to attach screenshots or PDFs (up to 10MB)
   - Comments: Text area for users to describe the issue in detail

#### Data Structure

The feedback data is structured as follows:

```typescript
type FeedbackData = {
  url: string;           // The property URL where the issue occurred
  comment: string;       // User's description of the issue
  file?: File;           // Optional screenshot or PDF attachment
  timestamp: number;     // When the feedback was submitted
  userAgent?: string;    // Browser/device information (can be added automatically)
  propertyId?: string;   // Optional reference to the property ID
};
```

#### Backend Integration

To connect the feedback feature to your backend, follow these steps:

##### 1. Create a Feedback API Endpoint

Set up an endpoint to receive feedback submissions:

```
POST /api/feedback
```

This endpoint should accept multipart/form-data to handle the file upload.

##### 2. Server-Side Implementation

Here's an example of how to implement the server-side handler (using Express.js and Multer for file handling):

```javascript
// Server-side implementation (Node.js/Express)
const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/feedback-attachments/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'feedback-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDFs and images
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs and images are allowed'));
    }
  }
});

// Handle feedback submission
router.post('/feedback', upload.single('file'), async (req, res) => {
  try {
    const { url, comment, propertyId } = req.body;
    const file = req.file ? req.file.path : null;
    
    // Store feedback in database
    const feedback = await db.feedbacks.create({
      url,
      comment,
      fileUrl: file,
      propertyId,
      timestamp: Date.now(),
      userAgent: req.headers['user-agent'],
      // Add user ID if authenticated
      userId: req.user?.id
    });
    
    // Optional: Send email notification to support team
    await sendFeedbackNotification({
      feedbackId: feedback.id,
      url,
      comment
    });
    
    res.status(200).json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

module.exports = router;
```

##### 3. Frontend Integration

To connect the feedback form to your backend API, modify the `handleFeedbackSubmit` function in the InvestmentAnalysis component:

```typescript
const handleFeedbackSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    // Create a FormData object to handle the file upload
    const formData = new FormData();
    formData.append('url', feedbackUrl);
    formData.append('comment', feedbackComment);
    if (feedbackFile) {
      formData.append('file', feedbackFile);
    }
    
    // If the property ID is available, include it
    if (propertyId) {
      formData.append('propertyId', propertyId);
    }
    
    // Send the data to your API endpoint
    const response = await fetch('/api/feedback', {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header when using FormData
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    // Show success message
    setSubmitSuccess(true);
    setFeedbackUrl('');
    setFeedbackComment('');
    setFeedbackFile(null);
    
    // Close modal after showing success message
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowFeedbackModal(false);
    }, 2000);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Implement error handling UI
    setSubmitError('Failed to submit feedback. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

##### 4. Feedback Management System

To effectively manage submitted feedback, consider implementing:

1. **Feedback Dashboard** - An admin interface to view and manage submitted feedback
2. **Status Tracking** - Ability to mark feedback as reviewed, in progress, or resolved
3. **User Notifications** - Optional feature to notify users when their feedback is addressed
4. **Analytics** - Track common issues to identify recurring problems

#### Security and Privacy Considerations

When implementing the feedback system, keep these security best practices in mind:

1. **File Validation** - Always validate uploaded files on the server side
2. **Size Limits** - Enforce reasonable file size limits (10MB is recommended)
3. **File Type Filtering** - Only allow safe file types (PDF, PNG, JPG, etc.)
4. **Sanitize Inputs** - Filter and sanitize text inputs to prevent XSS attacks
5. **CORS Policies** - Configure proper CORS headers if the API is on a different domain
6. **Rate Limiting** - Implement rate limiting to prevent abuse

#### Extended Functionality

For a more comprehensive feedback system, consider these enhancements:

1. **Categorized Issues** - Allow users to categorize the type of issue (UI problem, calculation error, missing data)
2. **Issue Severity** - Let users indicate how severe the issue is
3. **Screen Recording** - Integrate with browser APIs to allow optional screen recording for better context
4. **User Follow-up** - Collect optional user contact information for follow-up questions
5. **Auto-contextual Data** - Automatically include relevant context (current URL, user ID, property data) with the submission

## Future Enhancements

Consider these potential enhancements when planning your backend development:

1. **Historical Data Timeline** - Provide historical data points for property values and rental prices to enhance the projected property value chart.

2. **Comparable Properties** - Add an endpoint to fetch similar properties in the area for comparison.

3. **Investment Scenarios** - Support multiple investment scenarios (e.g., cash purchase, mortgage options) by extending the financial calculations.

4. **User Personalization** - Allow users to save custom assumptions for ROI calculations.

5. **Interactive Map Integration** - Provide geolocation data for amenities to enable map visualization.

## Conclusion

The InvestmentAnalysis component provides a comprehensive, user-friendly interface for property investment analysis. By following this integration guide, backend developers can seamlessly connect their data to the frontend component, ensuring a cohesive user experience.

For any questions or issues with the integration, please refer to the frontend development team. 