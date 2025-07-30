import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

async function example() {
    try {
        // Initialize the payment processor
        const processor = new SuiFlowPaymentProcessor();
        
        console.log('=== SuiFlow Payment Processor Integration Example ===\n');
        
        // 1. Get contract statistics
        console.log('1. Getting contract statistics...');
        const stats = await processor.getContractStats();
        console.log('Contract Stats:', stats);
        console.log();
        
        // 2. Get recent payment events
        console.log('2. Getting recent payment events...');
        const paymentEvents = await processor.getPaymentEvents(5);
        console.log(`Found ${paymentEvents.length} recent payment events:`);
        paymentEvents.forEach((event, index) => {
            console.log(`  ${index + 1}. Amount: ${event.data.total_amount} MIST, Merchant: ${event.data.merchant_id}`);
        });
        console.log();
        
        // 3. Get admin fee events
        console.log('3. Getting admin fee withdrawal events...');
        const adminEvents = await processor.getAdminFeeEvents(5);
        console.log(`Found ${adminEvents.length} admin fee events:`);
        adminEvents.forEach((event, index) => {
            console.log(`  ${index + 1}. Amount: ${event.data.amount_withdrawn} MIST`);
        });
        console.log();
        
        // 4. Example payment processing (commented out - requires actual coins)
        /*
        console.log('4. Processing a payment...');
        const merchantAddress = '0x123...'; // Replace with actual merchant address
        const customerKeypair = Ed25519Keypair.generate(); // In real app, load from secure storage
        const paymentCoinId = '0xabc...'; // Replace with actual coin object ID
        
        const paymentResult = await processor.processPayment(
            merchantAddress,
            'merchant_001',
            'product_123',
            paymentCoinId,
            customerKeypair
        );
        console.log('Payment Result:', paymentResult);
        */
        
        console.log('✅ Integration example completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in example:', error);
    }
}

// Run the example
example();
