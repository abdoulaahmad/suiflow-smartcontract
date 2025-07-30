#[test_only]
module suiflow::payment_processor_tests {
    use sui::test_scenario::{Self};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use suiflow::payment_processor::{Self, PaymentProcessor};

    // Test addresses
    const ADMIN: address = @0xA;
    const MERCHANT: address = @0xB;
    const CUSTOMER: address = @0xC;

    // Test constants
    const ADMIN_FEE_MIST: u64 = 10_000_000; // 0.01 SUI
    const PAYMENT_AMOUNT: u64 = 50_000_000; // 0.05 SUI

    #[test]
    fun test_init_payment_processor() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Check that the PaymentProcessor object was created and shared
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_shared<PaymentProcessor>(), 0);
            let processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            
            // Verify initial state
            assert!(payment_processor::get_admin_address(&processor) == ADMIN, 1);
            assert!(payment_processor::get_total_fees_collected(&processor) == 0, 2);
            assert!(payment_processor::get_total_payments_processed(&processor) == 0, 3);
            assert!(payment_processor::get_admin_fee() == ADMIN_FEE_MIST, 4);
            
            test_scenario::return_shared(processor);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_successful_payment() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Customer makes a payment
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            let payment_coin = coin::mint_for_testing<SUI>(PAYMENT_AMOUNT, test_scenario::ctx(&mut scenario));
            
            let merchant_id = b"merchant123";
            let product_id = b"product456";
            
            // Process the payment
            payment_processor::process_widget_payment(
                &mut processor,
                MERCHANT,
                merchant_id,
                product_id,
                payment_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            // Check processor state after payment
            assert!(payment_processor::get_total_fees_collected(&processor) == ADMIN_FEE_MIST, 5);
            assert!(payment_processor::get_total_payments_processed(&processor) == 1, 6);
            
            test_scenario::return_shared(processor);
        };
        
        // Check that merchant received the payment (minus admin fee)
        test_scenario::next_tx(&mut scenario, MERCHANT);
        {
            let merchant_coin = test_scenario::take_from_address<Coin<SUI>>(&scenario, MERCHANT);
            let expected_merchant_amount = PAYMENT_AMOUNT - ADMIN_FEE_MIST;
            assert!(coin::value(&merchant_coin) == expected_merchant_amount, 7);
            test_scenario::return_to_address(MERCHANT, merchant_coin);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suiflow::payment_processor::EInsufficientAmount)]
    fun test_insufficient_payment_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Customer tries to make insufficient payment
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            let insufficient_payment = coin::mint_for_testing<SUI>(ADMIN_FEE_MIST - 1, test_scenario::ctx(&mut scenario));
            
            let merchant_id = b"merchant123";
            let product_id = b"product456";
            
            // This should fail due to insufficient amount
            payment_processor::process_widget_payment(
                &mut processor,
                MERCHANT,
                merchant_id,
                product_id,
                insufficient_payment,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(processor);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_admin_fee_withdrawal() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Customer makes a payment first
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            let payment_coin = coin::mint_for_testing<SUI>(PAYMENT_AMOUNT, test_scenario::ctx(&mut scenario));
            
            payment_processor::process_widget_payment(
                &mut processor,
                MERCHANT,
                b"merchant123",
                b"product456",
                payment_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(processor);
        };
        
        // Admin withdraws fees
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            
            payment_processor::withdraw_admin_fees(&mut processor, test_scenario::ctx(&mut scenario));
            
            // Check that fees were reset to 0
            assert!(payment_processor::get_total_fees_collected(&processor) == 0, 8);
            
            test_scenario::return_shared(processor);
        };
        
        // Check that admin received the fees
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_coin = test_scenario::take_from_address<Coin<SUI>>(&scenario, ADMIN);
            assert!(coin::value(&admin_coin) == ADMIN_FEE_MIST, 9);
            test_scenario::return_to_address(ADMIN, admin_coin);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = suiflow::payment_processor::ENotAuthorized)]
    fun test_non_admin_cannot_withdraw_fees() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Customer makes a payment first
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            let payment_coin = coin::mint_for_testing<SUI>(PAYMENT_AMOUNT, test_scenario::ctx(&mut scenario));
            
            payment_processor::process_widget_payment(
                &mut processor,
                MERCHANT,
                b"merchant123",
                b"product456",
                payment_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(processor);
        };
        
        // Non-admin tries to withdraw fees (should fail)
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            
            // This should fail because CUSTOMER is not the admin
            payment_processor::withdraw_admin_fees(&mut processor, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(processor);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_payments() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Customer makes first payment
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            let payment_coin = coin::mint_for_testing<SUI>(PAYMENT_AMOUNT, test_scenario::ctx(&mut scenario));
            
            payment_processor::process_widget_payment(
                &mut processor,
                MERCHANT,
                b"merchant123",
                b"product1",
                payment_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(processor);
        };
        
        // Customer makes second payment
        test_scenario::next_tx(&mut scenario, CUSTOMER);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            let payment_coin = coin::mint_for_testing<SUI>(PAYMENT_AMOUNT * 2, test_scenario::ctx(&mut scenario));
            
            payment_processor::process_widget_payment(
                &mut processor,
                MERCHANT,
                b"merchant123",
                b"product2",
                payment_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            // Check accumulated state
            assert!(payment_processor::get_total_fees_collected(&processor) == ADMIN_FEE_MIST * 2, 10);
            assert!(payment_processor::get_total_payments_processed(&processor) == 2, 11);
            
            test_scenario::return_shared(processor);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_zero_fee_withdrawal() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        // Admin tries to withdraw fees when there are none
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            
            // This should work but not create any coin transfers
            payment_processor::withdraw_admin_fees(&mut processor, test_scenario::ctx(&mut scenario));
            
            // Fees should still be 0
            assert!(payment_processor::get_total_fees_collected(&processor) == 0, 12);
            
            test_scenario::return_shared(processor);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_view_functions() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize the payment processor
        {
            let ctx = test_scenario::ctx(&mut scenario);
            payment_processor::init_for_testing(ctx);
        };
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let processor = test_scenario::take_shared<PaymentProcessor>(&scenario);
            
            // Test all view functions
            assert!(payment_processor::get_admin_address(&processor) == ADMIN, 13);
            assert!(payment_processor::get_total_fees_collected(&processor) == 0, 14);
            assert!(payment_processor::get_total_payments_processed(&processor) == 0, 15);
            assert!(payment_processor::get_admin_fee() == ADMIN_FEE_MIST, 16);
            
            test_scenario::return_shared(processor);
        };
        
        test_scenario::end(scenario);
    }
}
