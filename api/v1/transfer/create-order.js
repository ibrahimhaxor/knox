// Complete Vercel Server for Patched OPay App
// Handles: /api/v1/transfer/create-order and all cashier endpoints

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const url = req.url;
    
    console.log('\n[!] ==========================================');
    console.log('[!] OPay Request Received');
    console.log('[!] URL:', url);
    console.log('[!] Time:', new Date().toISOString());
    console.log('[!] Headers:', req.headers);
    console.log('[!] Body:', req.body);
    console.log('[!] ==========================================\n');

    // Determine which endpoint was called
    let endpoint = 'unknown';
    if (url && url.includes('get_payment_info')) endpoint = 'get_payment_info';
    else if (url && url.includes('confirm_pay')) endpoint = 'confirm_pay';
    else if (url && url.includes('query_pay_result')) endpoint = 'query_pay_result';
    else if (url && url.includes('showStatus')) endpoint = 'showStatus';
    else if (url && url.includes('create-order')) endpoint = 'create-order';

    console.log('[+] Detected endpoint:', endpoint);

    // ============================================
    // Response Templates (Based on captured data)
    // ============================================

    // Template 1: Transfer Create Order Response
    const transferResponse = {
        code: "00000",
        message: "SUCCESSFUL",
        data: {
            orderStatus: "SUCCESS",
            serviceTypeTitle: "Money transfer",
            paymentResult: "Transaction is successful!",
            orderNo: `TFR_${Date.now()}`,
            orderTime: new Date().toISOString(),
            orderTimeUnix: Math.floor(Date.now() / 1000),
            saveBeneficiary: true
        }
    };

    // Template 2: Get Payment Info Response
    const paymentInfoResponse = {
        code: "00000",
        message: "SUCCESS",
        data: {
            paymentInfo: {
                orderNo: `PAY_${Date.now()}`,
                amount: "100.00",
                currency: "NGN",
                serviceType: "coinsTransfer",
                status: "SUCCESS",
                createdAt: new Date().toISOString()
            }
        }
    };

    // Template 3: Confirm Pay Response
    const confirmPayResponse = {
        code: "00000",
        message: "SUCCESS",
        data: {
            orderNo: `CONFIRM_${Date.now()}`,
            status: "SUCCESS",
            paymentResult: "Payment confirmed successfully",
            transactionTime: new Date().toISOString(),
            reference: `REF_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
    };

    // Template 4: Query Pay Result Response
    const queryResultResponse = {
        code: "00000",
        message: "SUCCESS",
        data: {
            orderNo: `QUERY_${Date.now()}`,
            status: "SUCCESS",
            orderStatus: "COMPLETED",
            paymentDetails: {
                amount: "100.00",
                currency: "NGN",
                method: "Wallet",
                timestamp: new Date().toISOString()
            }
        }
    };

    // Template 5: Show Status Response
    const showStatusResponse = {
        code: "00000",
        message: "SUCCESS",
        data: {
            orderId: `STATUS_${Date.now()}`,
            status: "SUCCESS",
            currentStatus: "COMPLETED",
            timeline: [
                { step: "Initiated", time: new Date().toISOString(), status: "done" },
                { step: "Processed", time: new Date().toISOString(), status: "done" },
                { step: "Completed", time: new Date().toISOString(), status: "current" }
            ]
        }
    };

    // Select response based on endpoint
    let responseData;
    switch(endpoint) {
        case 'get_payment_info':
            responseData = paymentInfoResponse;
            break;
        case 'confirm_pay':
            responseData = confirmPayResponse;
            break;
        case 'query_pay_result':
            responseData = queryResultResponse;
            break;
        case 'showStatus':
            responseData = showStatusResponse;
            break;
        case 'create-order':
        default:
            responseData = transferResponse;
    }

    // For patched app, we can return plain JSON
    // But to be safe, wrap in the expected format
    const plainJson = JSON.stringify(responseData);
    const encrypt_data = Buffer.from(plainJson).toString('base64');

    console.log('[+] Sending response for:', endpoint);
    console.log('[+] Response:', responseData);

    // Return in the format the app expects
    return res.status(200).json({
        encrypt_aes_key: "PATCHED_BYPASS_KEY",
        encrypt_data: encrypt_data
    });
}
