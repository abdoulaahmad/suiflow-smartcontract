import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

async function debugObjectId() {
    console.log('🔍 Debugging Object ID access...\n');
    
    const client = new SuiClient({ 
        url: getFullnodeUrl('testnet') 
    });
    
    // Test with the package ID first (we know this works)
    const packageId = '0xce43cd5a753080bb1546a3b575ca48892046699b580d89df5f384ca77da4641a0';
    console.log(`Testing package ID: ${packageId}`);
    console.log(`Package ID length: ${packageId.length}`);
    
    try {
        console.log('\nAttempting to fetch package...');
        const packageResult = await client.getObject({
            id: packageId,
            options: { showContent: true, showType: true }
        });
        
        console.log('✅ Package fetched successfully!');
        console.log('Package type:', packageResult.data?.type);
    } catch (error) {
        console.log('❌ Error fetching package:', error.message);
        return;
    }
    
    // Now try with the processor object using the exact same format
    const processorId = '0x33baa75593ccc45a8edd06798ff6f0319d432879968590a90c3c593ff55b23574';
    console.log(`\nTesting processor ID: ${processorId}`);
    console.log(`Processor ID length: ${processorId.length}`);
    
    // Try to get the processor object
    try {
        console.log('\nAttempting to fetch processor object...');
        const result = await client.getObject({
            id: processorId,
            options: { showContent: true, showType: true }
        });
        
        console.log('✅ Processor object fetched successfully!');
        console.log('Object type:', result.data?.type);
        if (result.data?.content?.fields) {
            console.log('Admin address:', result.data.content.fields.admin_address);
            console.log('Total fees:', result.data.content.fields.total_fees_collected);
            console.log('Total payments:', result.data.content.fields.total_payments_processed);
        }
        
    } catch (error) {
        console.log('❌ Error fetching processor object:', error.message);
    }
}

debugObjectId().catch(console.error);
