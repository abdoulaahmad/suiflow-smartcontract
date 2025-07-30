import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';
import dotenv from 'dotenv';

dotenv.config();

export class SuiFlowPaymentProcessor {
    constructor() {
        // Initialize Sui client
        this.client = new SuiClient({ 
            url: getFullnodeUrl(process.env.NETWORK || 'testnet') 
        });
        
        // Contract details
        this.packageId = process.env.PACKAGE_ID;
        this.processorObjectId = process.env.PROCESSOR_OBJECT_ID;
        
        // Initialize keypair if private key is provided
        if (process.env.PRIVATE_KEY) {
            this.keypair = Ed25519Keypair.fromSecretKey(fromB64(process.env.PRIVATE_KEY));
            this.address = this.keypair.getPublicKey().toSuiAddress();
        }
    }

    /**
     * Process a payment through the smart contract
     * @param {string} merchantAddress - The merchant's Sui address
     * @param {string} merchantId - Merchant identifier
     * @param {string} productId - Product identifier
     * @param {string} paymentCoinId - The coin object ID to use for payment
     * @param {Ed25519Keypair} senderKeypair - Keypair of the payment sender
     */
    async processPayment(merchantAddress, merchantId, productId, paymentCoinId, senderKeypair) {
        try {
            const tx = new TransactionBlock();
            
            // Convert strings to vector<u8> for Move
            const merchantIdBytes = Array.from(new TextEncoder().encode(merchantId));
            const productIdBytes = Array.from(new TextEncoder().encode(productId));
            
            tx.moveCall({
                target: `${this.packageId}::payment_processor::process_widget_payment`,
                arguments: [
                    tx.object(this.processorObjectId),
                    tx.pure(merchantAddress),
                    tx.pure(merchantIdBytes),
                    tx.pure(productIdBytes),
                    tx.object(paymentCoinId)
                ],
            });

            // Execute transaction
            const result = await this.client.signAndExecuteTransactionBlock({
                signer: senderKeypair,
                transactionBlock: tx,
            });

            console.log('Payment processed successfully!');
            console.log('Transaction digest:', result.digest);
            
            return result;
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    /**
     * Withdraw admin fees (admin only)
     */
    async withdrawAdminFees() {
        try {
            if (!this.keypair) {
                throw new Error('No keypair configured for admin operations');
            }

            const tx = new TransactionBlock();
            
            tx.moveCall({
                target: `${this.packageId}::payment_processor::withdraw_admin_fees`,
                arguments: [tx.object(this.processorObjectId)],
            });

            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
            });

            console.log('Admin fees withdrawn successfully!');
            console.log('Transaction digest:', result.digest);
            
            return result;
        } catch (error) {
            console.error('Error withdrawing admin fees:', error);
            throw error;
        }
    }

    /**
     * Get contract statistics
     */
    async getContractStats() {
        try {
            // Get the processor object to read its fields
            const processorObject = await this.client.getObject({
                id: this.processorObjectId,
                options: { showContent: true }
            });

            if (processorObject.data && processorObject.data.content) {
                const fields = processorObject.data.content.fields;
                return {
                    adminAddress: fields.admin_address,
                    totalFeesCollected: fields.total_fees_collected,
                    totalPaymentsProcessed: fields.total_payments_processed
                };
            }
            
            throw new Error('Could not fetch processor object');
        } catch (error) {
            console.error('Error getting contract stats:', error);
            throw error;
        }
    }

    /**
     * Get payment events
     * @param {number} limit - Number of events to fetch
     */
    async getPaymentEvents(limit = 10) {
        try {
            const events = await this.client.queryEvents({
                query: {
                    MoveEventType: `${this.packageId}::payment_processor::PaymentCompleted`
                },
                limit: limit,
                order: 'descending'
            });

            return events.data.map(event => ({
                id: event.id,
                timestamp: event.timestampMs,
                txDigest: event.transactionDigest,
                data: event.parsedJson
            }));
        } catch (error) {
            // If no events found or event type doesn't exist yet, return empty array
            if (error.message.includes('Invalid params') || error.code === -32602) {
                console.log('No payment events found yet (this is normal for a new contract)');
                return [];
            }
            console.error('Error fetching payment events:', error);
            throw error;
        }
    }

    /**
     * Get admin fee withdrawal events
     * @param {number} limit - Number of events to fetch
     */
    async getAdminFeeEvents(limit = 10) {
        try {
            const events = await this.client.queryEvents({
                query: {
                    MoveEventType: `${this.packageId}::payment_processor::AdminFeeWithdrawn`
                },
                limit: limit,
                order: 'descending'
            });

            return events.data.map(event => ({
                id: event.id,
                timestamp: event.timestampMs,
                txDigest: event.transactionDigest,
                data: event.parsedJson
            }));
        } catch (error) {
            // If no events found or event type doesn't exist yet, return empty array
            if (error.message.includes('Invalid params') || error.code === -32602) {
                console.log('No admin fee withdrawal events found yet (this is normal for a new contract)');
                return [];
            }
            console.error('Error fetching admin fee events:', error);
            throw error;
        }
    }

    /**
     * Get coins owned by an address
     * @param {string} address - The address to query
     * @param {string} coinType - The coin type (default: SUI)
     */
    async getCoins(address, coinType = '0x2::sui::SUI') {
        try {
            const coins = await this.client.getCoins({
                owner: address,
                coinType
            });
            
            return coins.data.map(coin => ({
                objectId: coin.coinObjectId,
                balance: coin.balance,
                digest: coin.digest
            }));
        } catch (error) {
            console.error('Error fetching coins:', error);
            throw error;
        }
    }
}

export default SuiFlowPaymentProcessor;
