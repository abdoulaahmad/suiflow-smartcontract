import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

async function debugObjectId() {
    console.log('🔍 Debugging Object ID access...\n');
    
    const client = new SuiClient({ 
        url: getFullnodeUrl('testnet') 
    });
    
    // Set the object ID directly - clean version from transaction
    const objectId = '0x33baa75593ccc45a8edd06798ff6f0319d432879968590a90c3c593ff55b23574';
    console.log(`Object ID: "${objectId}"`);
    console.log(`Object ID length: ${objectId.length}`);
    console.log(`Starts with 0x: ${objectId.startsWith('0x')}`);
    
    // Try to get the object
    try {
        console.log('\nAttempting to fetch object...');
        const result = await client.getObject({
            id: objectId,
            options: { showContent: true, showType: true }
        });
        
        console.log('✅ Object fetched successfully!');
        console.log('Object data:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.log('❌ Error fetching object:', error.message);
        console.log('Full error:', error);
    }
}

debugObjectId().catch(console.error);
