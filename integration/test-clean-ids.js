import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

async function testWithCleanIds() {
    console.log('🔍 Testing with manually cleaned IDs...\n');
    
    const client = new SuiClient({ 
        url: getFullnodeUrl('testnet') 
    });
    
    // Manually create clean IDs based on our deployed contract
    // Package: ce43cd5a753080bb1546a3b575ca48892046699b580d89df5f384ca77da4641a0 (64 chars)
    const packageId = '0x' + 'ce43cd5a753080bb1546a3b575ca48892046699b580d89df5f384ca77da4641a0';
    
    // Processor: 33baa75593ccc45a8edd06798ff6f0319d432879968590a90c3c593ff55b23574 (64 chars)  
    const processorId = '0x' + '33baa75593ccc45a8edd06798ff6f0319d432879968590a90c3c593ff55b23574';
    
    console.log(`Package ID: ${packageId} (${packageId.length})`);
    console.log(`Processor ID: ${processorId} (${processorId.length})`);
    
    if (packageId.length !== 66 || processorId.length !== 66) {
        console.log('❌ IDs are not 66 characters long!');
        return;
    }
    
    // Test package
    try {
        console.log('\n1. Testing package access...');
        const packageResult = await client.getObject({
            id: packageId,
            options: { showContent: true }
        });
        console.log('✅ Package accessible');
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
            console.log('📊 Contract Stats:');
            console.log(`  Admin: ${fields.admin_address}`);
            console.log(`  Total Payments: ${fields.total_payments_processed}`);
            console.log(`  Fees Collected: ${fields.total_fees_collected} MIST`);
        }
        
    } catch (error) {
        console.log('❌ Processor error:', error.message);
    }
}

testWithCleanIds().catch(console.error);
