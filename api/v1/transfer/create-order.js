// Complete OPay Mock Server for Cashier APIs
import crypto from 'crypto';

const STATIC_IV = Buffer.from('2022111500123456', 'utf8');
const AES_ALGO = 'aes-256-cbc';

function aesEncrypt(plaintext, keyBuffer) {
    const cipher = crypto.createCipheriv(AES_ALGO, keyBuffer, STATIC_IV);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function generateRandomAesKey() {
    return crypto.randomBytes(32);
}

export default async function handler(req, res) {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the full URL path
    const url = req.url;
    
    console.log('\n[!] ==========================================');
    console.log('[!] OPay Request Received');
    console.log('[!] URL:', url);
    console.log('[!] Full path:', req.headers['x-vercel-deployment-url'] || 'local');
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

    // Prepare response based on endpoint
    let responseData;
    switch(endpoint) {
        case 'get_payment_info':
            responseData = {
                code: "00000",
                message: "SUCCESS",
                data: {
                    paymentInfo: {
                        orderNo: `POC_${Date.now()}`,
                        amount: "100.00",
                        currency: "NGN",
                        serviceType: "coinsTransfer",
                        status: "PENDING"
                    }
                }
            };
            break;
            
        case 'confirm_pay':
            responseData = {
                code: "00000",
                message: "SUCCESS",
                data: {
                    orderNo: `CONFIRM_${Date.now()}`,
                    status: "SUCCESS",
                    paymentResult: "Transaction completed successfully",
                    transactionTime: new Date().toISOString()
                }
            };
            break;
            
        case 'query_pay_result':
            responseData = {
                code: "00000",
                message: "SUCCESS",
                data: {
                    orderNo: `QUERY_${Date.now()}`,
                    status: "SUCCESS",
                    orderStatus: "COMPLETED"
                }
            };
            break;
            
        case 'showStatus':
            responseData = {
                code: "00000",
                message: "SUCCESS",
                data: {
                    orderId: `STATUS_${Date.now()}`,
                    status: "SUCCESS",
                    currentStatus: "COMPLETED"
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
                    orderNo: `TRANSFER_${Date.now()}`,
                    paymentResult: "Transaction successful!"
                }
            };
    }

    const plaintext = JSON.stringify(responseData);
    const aesKey = generateRandomAesKey();
    const encryptedData = aesEncrypt(plaintext, aesKey);

    console.log('[+] Sending response for:', endpoint);
    console.log('[+] Response:', responseData);

    return res.status(200).json({
        encrypt_aes_key: aesKey.toString('base64'),
        encrypt_data: encryptedData
    });
}
