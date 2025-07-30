import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';

async function testPaymentFlow() {
    console.log('💳 Testing payment processing flow...\n');
    
    try {
        // Step 1: Initialize
        const processor = new SuiFlowPaymentProcessor();
        const customerKeypair = Ed25519Keypair.fromSecretKey(fromB64(process.env.PRIVATE_KEY));
        const customerAddress = customerKeypair.getPublicKey().toSuiAddress();
        
        console.log('1. Setup completed:');
        console.log(`   Customer Address: ${customerAddress}`);
        console.log(`   Contract Package: ${processor.packageId}\n`);
        
        // Step 2: Check customer's balance
        console.log('2. Checking customer balance...');
        const coins = await processor.getCoins(customerAddress);
        console.log(`✅ Found ${coins.length} SUI coins`);
        
        if (coins.length === 0) {
            throw new Error('No SUI coins found. Please fund your wallet first.');
        }
        
        const totalBalance = coins.reduce((sum, coin) => sum + parseInt(coin.balance), 0);
        console.log(`   Total Balance: ${totalBalance / 1000000000} SUI\n`);
        
        // Step 3: Find suitable coin for payment
        const paymentAmount = 50000000; // 0.05 SUI
        const adminFee = 10000000;      // 0.01 SUI
        const totalRequired = paymentAmount + adminFee;
        
        console.log('3. Finding suitable coin for payment...');
        console.log(`   Payment Amount: ${paymentAmount / 1000000000} SUI`);
        console.log(`   Admin Fee: ${adminFee / 1000000000} SUI`);
        console.log(`   Total Required: ${totalRequired / 1000000000} SUI`);
        
        const suitableCoin = coins.find(coin => parseInt(coin.balance) >= totalRequired);
        
        if (!suitableCoin) {
            throw new Error(`Insufficient balance. Need at least ${totalRequired / 1000000000} SUI`);
        }
        
        console.log(`✅ Found suitable coin: ${suitableCoin.objectId}`);
        console.log(`   Coin Balance: ${suitableCoin.balance / 1000000000} SUI\n`);
        
        // Step 4: Process the payment
        console.log('4. Processing payment...');
        const merchantAddress = '0x1234567890123456789012345678901234567890123456789012345678901234'; // Example merchant
        const merchantId = `test_merchant_${Date.now()}`;
        const productId = `test_product_${Date.now()}`;
        
        console.log(`   Merchant: ${merchantAddress.slice(0, 8)}...`);
        console.log(`   Merchant ID: ${merchantId}`);
        console.log(`   Product ID: ${productId}`);
        
        // NOTE: This will actually process a real payment on testnet
        console.log('\n⚠️  This will process a REAL payment on testnet!');
        console.log('💰 You will spend ~0.06 SUI (payment + admin fee + gas)');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
        
        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const result = await processor.processPayment(
            merchantAddress,
            merchantId,
            productId,
            suitableCoin.objectId,
            customerKeypair
        );
        
        console.log('✅ Payment processed successfully!');
        console.log(`   Transaction Digest: ${result.digest}`);
        console.log(`   View on Explorer: https://testnet.suivision.xyz/txblock/${result.digest}\n`);
        
        // Step 5: Verify the payment
        console.log('5. Verifying payment...');
        const newStats = await processor.getContractStats();
        console.log(`✅ Contract updated:`);
        console.log(`   Total Payments: ${newStats.totalPaymentsProcessed}`);
        console.log(`   Fees Collected: ${newStats.totalFeesCollected / 1000000000} SUI\n`);
        
        // Step 6: Check recent events
        console.log('6. Checking recent payment events...');
        const recentEvents = await processor.getPaymentEvents(1);
        if (recentEvents.length > 0) {
            const latestEvent = recentEvents[0];
            console.log('✅ Latest payment event:');
            console.log(`   Merchant ID: ${latestEvent.data.merchant_id}`);
            console.log(`   Product ID: ${latestEvent.data.product_id}`);
            console.log(`   Total Amount: ${latestEvent.data.total_amount} MIST`);
            console.log(`   Merchant Received: ${latestEvent.data.merchant_received} MIST`);
            console.log(`   Admin Fee: ${latestEvent.data.admin_fee} MIST`);
        }
        
        console.log('\n🎉 Payment flow test completed successfully!');
        console.log('✅ Your integration is working properly.\n');
        
    } catch (error) {
        console.error('❌ Payment flow test failed:', error.message);
        console.log('\n🔍 Common issues:');
        console.log('1. Insufficient balance - fund your wallet with testnet SUI');
        console.log('2. Network issues - check your internet connection');
        console.log('3. Gas estimation - transaction may need more gas');
    }
}

testPaymentFlow();
