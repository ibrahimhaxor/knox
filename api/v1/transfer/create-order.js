// api/v1/transfer/create-order.js
export default async function handler(req, res) {
    const url = req.url;
    const timestamp = Date.now();
    
    console.log('[+] Request to:', url);
    console.log('[+] Headers:', req.headers);
    
    // Determine endpoint
    let endpoint = 'unknown';
    if (url.includes('confirm_pay')) endpoint = 'confirm_pay';
    else if (url.includes('get_payment_info')) endpoint = 'get_payment_info';
    else if (url.includes('query_pay_result')) endpoint = 'query_pay_result';
    else if (url.includes('showStatus')) endpoint = 'showStatus';
    else if (url.includes('create-order')) endpoint = 'create-order';
    
    // Build response based on endpoint
    let responseData;
    
    switch(endpoint) {
        case 'confirm_pay':
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    paymentNo: `${timestamp}${Math.random().toString().slice(2, 15)}`,
                    isPolling: true,
                    orderNo: `${timestamp}${Math.random().toString().slice(2, 15)}`
                }
            };
            break;
            
        case 'get_payment_info':
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    paymentInfo: {
                        orderNo: timestamp.toString(),
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
                    orderNo: timestamp.toString(),
                    status: "SUCCESS"
                }
            };
            break;
            
        default:
            responseData = {
                code: "00000",
                message: "SUCCESSFUL",
                data: {
                    orderStatus: "SUCCESS",
                    orderNo: timestamp.toString(),
                    paymentResult: "Transaction is successful!"
                }
            };
    }
    
    // Convert to base64 wrapper
    const plainJson = JSON.stringify(responseData);
    const encrypt_data = Buffer.from(plainJson).toString('base64');
    
    // Add headers that mimic a real server
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Kong-Upstream-Latency', '76');
    res.setHeader('X-Kong-Proxy-Latency', '2');
    res.setHeader('Via', '1.1 kong/3.9.1');
    res.setHeader('Server', 'cloudflare');
    res.setHeader('Cache-Control', 'no-cache');
    
    return res.status(200).json({
        encrypt_aes_key: "PATCHED_BYPASS_KEY",
        encrypt_data: encrypt_data
    });
}
