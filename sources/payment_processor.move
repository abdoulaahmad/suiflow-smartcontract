module suiflow::payment_processor {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::object::{Self, UID};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;

    // Admin fee: 0.01 SUI (10,000,000 MIST)
    const ADMIN_FEE_MIST: u64 = 10_000_000;

    // Error codes
    const EInsufficientAmount: u64 = 1;
    const EUnauthorized: u64 = 2;

    // Payment processor object
    public struct PaymentProcessor has key {
        id: UID,
        admin_address: address,
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

    // Admin address updated event
    public struct AdminAddressUpdated has copy, drop {
        old_admin: address,
        new_admin: address,
    }

    // Initialize the payment processor with a given admin wallet
    public entry fun init(admin_address: address, ctx: &mut TxContext) {
        let processor = PaymentProcessor {
            id: object::new(ctx),
            admin_address,
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
        product_id: vector<u8>, // Optional, pass empty vec if unused
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let payment_amount = coin::value(&payment);
        let customer_address = tx_context::sender(ctx);

        // Validate minimum payment
        assert!(payment_amount > ADMIN_FEE_MIST, EInsufficientAmount);

        let mut payment_balance = coin::into_balance(payment);

        // Split admin fee and send instantly
        let admin_fee_balance = balance::split(&mut payment_balance, ADMIN_FEE_MIST);
        let admin_fee_coin = coin::from_balance(admin_fee_balance, ctx);
        transfer::public_transfer(admin_fee_coin, processor.admin_address);

        // Send remaining to merchant
        let merchant_amount = balance::value(&payment_balance);
        let merchant_coin = coin::from_balance(payment_balance, ctx);
        transfer::public_transfer(merchant_coin, merchant_address);

        // Emit payment event
        let product_str = if (vector::length(&product_id) == 0) {
            string::utf8(b"general")
        } else {
            string::utf8(product_id)
        };

        event::emit(PaymentCompleted {
            merchant_id: string::utf8(merchant_id),
            merchant_address,
            customer_address,
            total_amount: payment_amount,
            merchant_received: merchant_amount,
            admin_fee: ADMIN_FEE_MIST,
            product_id: product_str,
        });

        // Update stats
        processor.total_payments_processed = processor.total_payments_processed + 1;
    }

    // Admin can update the admin wallet address
    public entry fun update_admin(
        processor: &mut PaymentProcessor,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == processor.admin_address, EUnauthorized);

        let old_admin = processor.admin_address;
        processor.admin_address = new_admin;

        event::emit(AdminAddressUpdated {
            old_admin,
            new_admin,
        });
    }

    // View functions
    public fun get_admin_address(processor: &PaymentProcessor): address {
        processor.admin_address
    }

    public fun get_total_payments_processed(processor: &PaymentProcessor): u64 {
        processor.total_payments_processed
    }

    public fun get_admin_fee(): u64 {
        ADMIN_FEE_MIST
    }
}
