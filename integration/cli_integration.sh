#!/bin/bash
# Smart Contract Integration Script

# Your deployed contract details
PACKAGE_ID="0xce43cd5a753080bb1546a3b575ca48892046699b580d89df5f384ca77da4641a0"
PROCESSOR_OBJECT_ID="0x33baa75593ccc45a8edd06798ff6f0319d432879968590a90c3c593ff55b23574"

# Function to process a payment
process_payment() {
    local merchant_address=$1
    local merchant_id=$2
    local product_id=$3
    local payment_coin_id=$4
    local gas_budget=${5:-10000000}
    
    echo "Processing payment..."
    sui client call \
        --package $PACKAGE_ID \
        --module payment_processor \
        --function process_widget_payment \
        --args $PROCESSOR_OBJECT_ID $merchant_address "\"$merchant_id\"" "\"$product_id\"" $payment_coin_id \
        --gas-budget $gas_budget
}

# Function to withdraw admin fees
withdraw_admin_fees() {
    local gas_budget=${1:-10000000}
    
    echo "Withdrawing admin fees..."
    sui client call \
        --package $PACKAGE_ID \
        --module payment_processor \
        --function withdraw_admin_fees \
        --args $PROCESSOR_OBJECT_ID \
        --gas-budget $gas_budget
}

# Function to get contract stats
get_stats() {
    echo "Getting contract statistics..."
    
    # Get admin address
    sui client call \
        --package $PACKAGE_ID \
        --module payment_processor \
        --function get_admin_address \
        --args $PROCESSOR_OBJECT_ID \
        --gas-budget 1000000
    
    # Get total fees collected
    sui client call \
        --package $PACKAGE_ID \
        --module payment_processor \
        --function get_total_fees_collected \
        --args $PROCESSOR_OBJECT_ID \
        --gas-budget 1000000
    
    # Get total payments processed
    sui client call \
        --package $PACKAGE_ID \
        --module payment_processor \
        --function get_total_payments_processed \
        --args $PROCESSOR_OBJECT_ID \
        --gas-budget 1000000
}

# Example usage:
# process_payment 0x123... "merchant_001" "product_456" 0xabc...
# withdraw_admin_fees
# get_stats
