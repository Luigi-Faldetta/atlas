#!/usr/bin/env node
/**
 * Enhanced Frontend Validation Test
 * Tests the enhanced analysis integration on the /tools page
 * Following rapid-prototyping-beer-test-001.mdc for quick validation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Enhanced Frontend Validation Test');
console.log('=====================================\n');

async function validateEnhancedAnalysisIntegration() {
  const results = {
    buildTest: false,
    typeScriptCheck: false,
    enhancedDataStructure: false,
    toolsPageIntegration: false,
    sampleDataEnhanced: false
  };

  try {
    // Test 1: Build validation
    console.log('📦 Test 1: Frontend Build Validation...');
    try {
      execSync('cd frontend && npm run build', { stdio: 'pipe' });
      results.buildTest = true;
      console.log('✅ Frontend builds successfully');
    } catch (error) {
      console.log('❌ Frontend build failed');
      console.log(error.stdout?.toString() || error.message);
    }

    // Test 2: TypeScript validation
    console.log('\n🔍 Test 2: TypeScript Check...');
    try {
      const tscOutput = execSync('cd frontend && npx tsc --noEmit', { stdio: 'pipe' });
      results.typeScriptCheck = true;
      console.log('✅ TypeScript validation passed');
    } catch (error) {
      console.log('❌ TypeScript validation failed');
      console.log(error.stdout?.toString() || error.message);
    }

    // Test 3: Enhanced data structure validation
    console.log('\n📊 Test 3: Enhanced Data Structure...');
    const toolsPagePath = path.join('frontend', 'app', 'tools', 'page.tsx');
    if (fs.existsSync(toolsPagePath)) {
      const toolsPageContent = fs.readFileSync(toolsPagePath, 'utf8');
      
      const hasEnhancedTypes = toolsPageContent.includes('reasoning_process?:') &&
                              toolsPageContent.includes('self_reflection?:') &&
                              toolsPageContent.includes('analysis_context?:') &&
                              toolsPageContent.includes('validation?:') &&
                              toolsPageContent.includes('metadata?:');
      
      if (hasEnhancedTypes) {
        results.enhancedDataStructure = true;
        console.log('✅ Enhanced analysis types defined');
      } else {
        console.log('❌ Enhanced analysis types missing');
      }
    } else {
      console.log('❌ Tools page not found');
    }

    // Test 4: Tools page integration
    console.log('\n🔧 Test 4: Tools Page Integration...');
    if (fs.existsSync(toolsPagePath)) {
      const toolsPageContent = fs.readFileSync(toolsPagePath, 'utf8');
      
      const hasIntegration = toolsPageContent.includes('isEnhancedAnalysis={isEnhancedAnalysis(analysisResult)}') &&
                            toolsPageContent.includes('agenticFeatures={getAgenticFeatures(analysisResult)}') &&
                            toolsPageContent.includes('reasoningProcess={') &&
                            toolsPageContent.includes('selfReflection={') &&
                            toolsPageContent.includes('confidenceScores={');
      
      if (hasIntegration) {
        results.toolsPageIntegration = true;
        console.log('✅ Enhanced analysis integration found');
      } else {
        console.log('❌ Enhanced analysis integration missing');
      }
    }

    // Test 5: Sample data enhanced features
    console.log('\n🎯 Test 5: Sample Data Enhanced Features...');
    if (fs.existsSync(toolsPagePath)) {
      const toolsPageContent = fs.readFileSync(toolsPagePath, 'utf8');
      
      const hasSampleEnhanced = toolsPageContent.includes('reasoning_process: `STEP 1: INITIAL ASSESSMENT') &&
                               toolsPageContent.includes('self_reflection: `VALIDATION REVIEW:') &&
                               toolsPageContent.includes('financial_metrics: {') &&
                               toolsPageContent.includes('analysis_context: {') &&
                               toolsPageContent.includes('agentic_patterns: [');
      
      if (hasSampleEnhanced) {
        results.sampleDataEnhanced = true;
        console.log('✅ Sample data includes enhanced features');
      } else {
        console.log('❌ Sample data missing enhanced features');
      }
    }

  } catch (error) {
    console.error('🚨 Validation error:', error.message);
  }

  return results;
}

async function validateInvestmentAnalysisComponent() {
  console.log('\n🎨 Test 6: InvestmentAnalysis Component...');
  const componentPath = path.join('frontend', 'components', 'InvestmentAnalysis.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ InvestmentAnalysis component not found');
    return false;
  }

  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  const hasEnhancedProps = componentContent.includes('isEnhancedAnalysis?:') &&
                          componentContent.includes('agenticFeatures?:') &&
                          componentContent.includes('reasoningProcess?:') &&
                          componentContent.includes('selfReflection?:') &&
                          componentContent.includes('confidenceScores?:');

  const hasEnhancedSection = componentContent.includes('Enhanced AI Analysis Features Section') &&
                            componentContent.includes('chainOfThought') &&
                            componentContent.includes('selfReflection') &&
                            componentContent.includes('confidenceScoring') &&
                            componentContent.includes('qualityValidation');

  if (hasEnhancedProps && hasEnhancedSection) {
    console.log('✅ InvestmentAnalysis component has enhanced features');
    return true;
  } else {
    console.log('❌ InvestmentAnalysis component missing enhanced features');
    return false;
  }
}

async function runValidation() {
  const startTime = Date.now();
  
  console.log('🚀 Starting Enhanced Analysis Validation...\n');
  
  const results = await validateEnhancedAnalysisIntegration();
  const componentValid = await validateInvestmentAnalysisComponent();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n📊 VALIDATION RESULTS');
  console.log('=====================');
  console.log(`✅ Build Test: ${results.buildTest ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ TypeScript Check: ${results.typeScriptCheck ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Enhanced Data Structure: ${results.enhancedDataStructure ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Tools Page Integration: ${results.toolsPageIntegration ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Sample Data Enhanced: ${results.sampleDataEnhanced ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Component Enhanced: ${componentValid ? 'PASSED' : 'FAILED'}`);
  
  const totalTests = 6;
  const passedTests = Object.values(results).filter(Boolean).length + (componentValid ? 1 : 0);
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n📈 OVERALL SCORE: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log(`⏱️  Duration: ${duration}s`);
  
  if (passRate === 100) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Enhanced analysis integration is complete');
    console.log('✅ Ready for backend service testing');
    console.log('\nNext steps:');
    console.log('1. Start backend services (see PHASE_2_TESTING_VALIDATION.md)');
    console.log('2. Test with sample data: http://localhost:3000/tools');
    console.log('3. Test with real property URLs');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Please review the failed tests above and fix any issues.');
  }
  
  return passRate === 100;
}

// Run the validation
if (require.main === module) {
  runValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('🚨 Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { runValidation }; 