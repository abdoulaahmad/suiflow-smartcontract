import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

async function testWithCorrectIds() {
    console.log('🔍 Testing with correct IDs from transaction JSON...\n');
    
    const client = new SuiClient({ 
        url: getFullnodeUrl('testnet') 
    });
    
    // Extract exact IDs from the transaction JSON
    const packageId = '0xce43cd5a753080bb1546a3b575ca48892204699b580d89df5f384ca77da4641a0';
    const processorId = '0x33baa75593ccc45a8edd06798ff6f0319d43287968590a90c3c593ff55b23574';
    
    console.log(`Package ID: ${packageId}`);
    console.log(`Package ID length: ${packageId.length}`);
    console.log(`Processor ID: ${processorId}`);
    console.log(`Processor ID length: ${processorId.length}`);
    
    // Test package
    try {
        console.log('\n1. Testing package access...');
        const packageResult = await client.getObject({
            id: packageId,
            options: { showContent: true, showType: true }
        });
        console.log('✅ Package accessible');
        console.log('Package type:', packageResult.data?.type);
    } catch (error) {
        console.log('❌ Package error:', error.message);
    }
    
    // Test processor 
    try {
        console.log('\n2. Testing processor object access...');
        const processorResult = await client.getObject({
            id: processorId,
            options: { showContent: true, showType: true }
        });
        console.log('✅ Processor object accessible!');
        console.log('Type:', processorResult.data?.type);
        
        if (processorResult.data?.content?.fields) {
            const fields = processorResult.data.content.fields;
            console.log('\n📊 Contract Stats:');
            console.log(`  Admin: ${fields.admin_address}`);
            console.log(`  Total Payments: ${fields.total_payments_processed}`);
            console.log(`  Fees Collected: ${fields.total_fees_collected} MIST`);
        }
        
    } catch (error) {
        console.log('❌ Processor error:', error.message);
    }
}

testWithCorrectIds().catch(console.error);
