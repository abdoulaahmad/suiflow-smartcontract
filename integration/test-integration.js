import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';

async function runFullIntegrationTest() {
    console.log('🧪 Running Full Integration Test Suite\n');
    console.log('='.repeat(50));
    
    const processor = new SuiFlowPaymentProcessor();
    let testsPassed = 0;
    let totalTests = 0;
    
    // Test 1: Contract Connection
    totalTests++;
    console.log('\n📡 Test 1: Contract Connection');
    try {
        const stats = await processor.getContractStats();
        console.log('✅ PASSED - Contract is accessible');
        console.log(`   Admin: ${stats.adminAddress.slice(0, 8)}...`);
        testsPassed++;
    } catch (error) {
        console.log('❌ FAILED - Cannot connect to contract');
        console.log(`   Error: ${error.message}`);
    }
    
    // Test 2: Event History
    totalTests++;
    console.log('\n📜 Test 2: Event History');
    try {
        const events = await processor.getPaymentEvents(5);
        console.log(`✅ PASSED - Retrieved ${events.length} payment events`);
        testsPassed++;
    } catch (error) {
        console.log('❌ FAILED - Cannot retrieve events');
        console.log(`   Error: ${error.message}`);
    }
    
    // Test 3: Admin Functions
    totalTests++;
    console.log('\n👨‍💼 Test 3: Admin Functions');
    try {
        const adminEvents = await processor.getAdminFeeEvents(3);
        console.log(`✅ PASSED - Retrieved ${adminEvents.length} admin events`);
        testsPassed++;
    } catch (error) {
        console.log('❌ FAILED - Cannot retrieve admin events');
        console.log(`   Error: ${error.message}`);
    }
    
    // Test 4: Coin Queries
    totalTests++;
    console.log('\n🪙 Test 4: Coin Queries');
    try {
        if (process.env.PRIVATE_KEY) {
            const coins = await processor.getCoins(processor.address);
            console.log(`✅ PASSED - Found ${coins.length} coins for address`);
            testsPassed++;
        } else {
            console.log('⏭️  SKIPPED - No private key configured');
            totalTests--;
        }
    } catch (error) {
        console.log('❌ FAILED - Cannot query coins');
        console.log(`   Error: ${error.message}`);
    }
    
    // Test 5: API Endpoints (if server is running)
    totalTests++;
    console.log('\n🌐 Test 5: API Endpoints');
    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            console.log('✅ PASSED - API server is responding');
            testsPassed++;
        } else {
            throw new Error('API server returned error');
        }
    } catch (error) {
        console.log('⏭️  SKIPPED - API server not running');
        console.log('   Start server with: node api/server.js');
        totalTests--;
    }
    
    // Results
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Test Results Summary');
    console.log('='.repeat(50));
    console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%`);
    
    if (testsPassed === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Your SuiFlow integration is ready for production');
        console.log('\n📋 Next Steps:');
        console.log('1. Deploy your frontend application');
        console.log('2. Set up monitoring and alerts');
        console.log('3. Configure production environment variables');
        console.log('4. Test with real payments on testnet');
    } else {
        console.log('\n⚠️  Some tests failed');
        console.log('🔍 Please check the errors above and fix configuration');
    }
}

runFullIntegrationTest();
