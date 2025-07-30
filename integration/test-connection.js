import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';

async function testBasicConnection() {
    console.log('🔄 Testing basic connection to SuiFlow contract...\n');
    
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
        
        // Step 3: Test event queries
        console.log('3. Fetching recent payment events...');
        const paymentEvents = await processor.getPaymentEvents(3);
        console.log(`✅ Found ${paymentEvents.length} recent payment events`);
        
        if (paymentEvents.length > 0) {
            paymentEvents.forEach((event, i) => {
                console.log(`   ${i + 1}. ${event.data.merchant_id} - ${event.data.total_amount} MIST`);
            });
        } else {
            console.log('   No payment events found (this is normal for a new contract)');
        }
        
        console.log('\n🎉 Basic integration test completed successfully!');
        console.log('✅ Your contract is accessible and working properly.\n');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        console.log('\n🔍 Troubleshooting:');
        console.log('1. Check your .env file has correct values');
        console.log('2. Ensure you have internet connection');
        console.log('3. Verify the contract is deployed on testnet');
    }
}

testBasicConnection();
