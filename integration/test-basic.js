import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';

async function testBasicFunctionality() {
    console.log('🔄 Testing basic SuiFlow functionality...\n');
    
    try {
        // Step 1: Initialize processor
        console.log('1. Initializing SuiFlow Payment Processor...');
        const processor = new SuiFlowPaymentProcessor();
        console.log('✅ Processor initialized');
        console.log(`   Package ID: ${processor.packageId}`);
        console.log(`   Processor Object: ${processor.processorObjectId}\n`);
        
        // Step 2: Test contract stats
        console.log('2. Fetching contract statistics...');
        const stats = await processor.getContractStats();
        console.log('✅ Contract stats retrieved:');
        console.log(`   Admin Address: ${stats.adminAddress}`);
        console.log(`   Total Payments: ${stats.totalPaymentsProcessed}`);
        console.log(`   Fees Collected: ${stats.totalFeesCollected} MIST\n`);
        
        console.log('🎉 Integration test successful!');
        console.log('✅ Your SuiFlow smart contract is ready for integration!');
        
    } catch (error) {
        console.log('❌ Integration test failed:', error.message);
        console.log('\n🔍 Troubleshooting:');
        console.log('1. Check your .env file has correct values');
        console.log('2. Ensure you have internet connection');
        console.log('3. Verify the contract is deployed on testnet');
    }
}

testBasicFunctionality();
