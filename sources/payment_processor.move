module suiflow::payment_processor {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::object::{Self, UID};
    use sui::event;
    use std::string::{Self, String};

    // Admin fee: 0.01 SUI (10,000,000 MIST)
    const ADMIN_FEE_MIST: u64 = 10_000_000;
    
    // Error codes
    const EInsufficientAmount: u64 = 1;
    const ENotAuthorized: u64 = 2;

    // Payment processor object
    public struct PaymentProcessor has key {
        id: UID,
        admin_address: address,
        total_fees_collected: Balance<SUI>,
        total_payments_processed: u64,
    }

    // Payment completed event
    public struct PaymentCompleted has copy, drop {
        merchant_id: String,
        merchant_address: address,
        customer_address: address,
        total_amount: u64,
        merchant_received: u64,
        admin_fee: u64,
        product_id: String,
    }

    // Admin fee withdrawn event
    public struct AdminFeeWithdrawn has copy, drop {
        admin_address: address,
        amount_withdrawn: u64,
    }

    // Initialize the payment processor (called once during deployment)
    fun init(ctx: &mut TxContext) {
        let processor = PaymentProcessor {
            id: object::new(ctx),
            admin_address: tx_context::sender(ctx),
            total_fees_collected: balance::zero(),
            total_payments_processed: 0,
        };
        
        // Share the processor object so anyone can use it
        transfer::share_object(processor);
    }

    // Main payment function
    public entry fun process_widget_payment(
        processor: &mut PaymentProcessor,
        merchant_address: address,
        merchant_id: vector<u8>,
        product_id: vector<u8>,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let payment_amount = coin::value(&payment);
        let customer_address = tx_context::sender(ctx);
        
        // Validate minimum payment (must be more than admin fee)
        assert!(payment_amount > ADMIN_FEE_MIST, EInsufficientAmount);
        
        // Calculate amounts
        let net_amount = payment_amount - ADMIN_FEE_MIST;
        
        // Convert coin to balance for splitting
        let payment_balance = coin::into_balance(payment);
        
        // Split admin fee and add to processor balance
        let admin_fee_balance = balance::split(&mut payment_balance, ADMIN_FEE_MIST);
        balance::join(&mut processor.total_fees_collected, admin_fee_balance);
        
        // Send remaining amount to merchant
        let merchant_coin = coin::from_balance(payment_balance, ctx);
        transfer::public_transfer(merchant_coin, merchant_address);
        
        // Emit payment event
        event::emit(PaymentCompleted {
            merchant_id: string::utf8(merchant_id),
            merchant_address,
            customer_address,
            total_amount: payment_amount,
            merchant_received: net_amount,
            admin_fee: ADMIN_FEE_MIST,
            product_id: string::utf8(product_id),
        });
        
        // Update payment counter
        processor.total_payments_processed = processor.total_payments_processed + 1;
    }

    // Admin function to withdraw collected fees
    public entry fun withdraw_admin_fees(
        processor: &mut PaymentProcessor,
        ctx: &mut TxContext
    ) {
        // Only admin can withdraw
        assert!(tx_context::sender(ctx) == processor.admin_address, ENotAuthorized);
        
        let fee_amount = balance::value(&processor.total_fees_collected);
        if (fee_amount > 0) {
            let fee_coin = coin::from_balance(
                balance::withdraw_all(&mut processor.total_fees_collected), 
                ctx
            );
            transfer::public_transfer(fee_coin, processor.admin_address);
            
            // Emit withdrawal event
            event::emit(AdminFeeWithdrawn {
                admin_address: processor.admin_address,
                amount_withdrawn: fee_amount,
            });
        }
    }

    // View functions for reading contract state
    public fun get_admin_address(processor: &PaymentProcessor): address {
        processor.admin_address
    }

    public fun get_total_fees_collected(processor: &PaymentProcessor): u64 {
        balance::value(&processor.total_fees_collected)
    }

    public fun get_total_payments_processed(processor: &PaymentProcessor): u64 {
        processor.total_payments_processed
    }

    public fun get_admin_fee(): u64 {
        ADMIN_FEE_MIST
    }

    // Test helper function
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
