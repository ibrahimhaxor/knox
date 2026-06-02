// Complete OPay Mock Server for Cashier APIs
// Handles: get_payment_info, confirm_pay, query_pay_result, showStatus
// Deploy to: https://knox-sigma.vercel.app

import crypto from 'crypto';

// ============================================
// Configuration
// ============================================

const STATIC_IV = Buffer.from('2022111500123456', 'utf8');
const AES_ALGO = 'aes-256-cbc';

// Helper: AES Encrypt
function aesEncrypt(plaintext, keyBuffer) {
    const cipher = crypto.createCipheriv(AES_ALGO, keyBuffer, STATIC_IV);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

// Helper: AES Decrypt (to read incoming requests)
function aesDecrypt(encryptedBase64, keyBuffer) {
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const decipher = crypto.createDecipheriv(AES_ALGO, keyBuffer, STATIC_IV);
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

// Generate random AES key (32 bytes for AES-256)
function generateRandomAesKey() {
    return crypto.randomBytes(32);
}

// Log helper
function logRequest(type, data) {
    console.log(`\n[${new Date().toISOString()}] ${type}:`);
    console.log(JSON.stringify(data, null, 2));
}

// ============================================
// Main Handler - Routes to appropriate endpoint
// ============================================

export default async function handler(req, res) {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const url = req.url;
    const { encrypt_aes_key, encrypt_data } = req.body;

    console.log('\n[!] ==========================================');
    console.log('[!] OPay Request Received');
    console.log('[!] URL:', url);
    console.log('[!] Time:', new Date().toISOString());
    console.log('[!] Headers:', req.headers);
    console.log('[!] ==========================================\n');

    // Route to appropriate handler based on URL
    if (url.includes('/cashier-service/cashier/v1/get_payment_info')) {
        return handleGetPaymentInfo(req, res);
    } 
    else if (url.includes('/cashier-service/cashier/v1/confirm_pay')) {
        return handleConfirmPay(req, res);
    }
    else if (url.includes('/cashier-service/cashier/v1/query_pay_result')) {
        return handleQueryPayResult(req, res);
    }
    else if (url.includes('/api/order/v2/showStatus')) {
        return handleShowStatus(req, res);
    }
    else if (url.includes('/api/v1/transfer/create-order')) {
        return handleTransferOrder(req, res);
    }
    else {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
}

// ============================================
// 1. Get Payment Info Handler
// ============================================

async function handleGetPaymentInfo(req, res) {
    console.log('[+] Handling: get_payment_info');
    
    // Try to decrypt incoming request if possible
    try {
        // Note: You'd need the RSA private key or captured AES key
        // For now, just log what we received
        if (req.body.encrypt_data) {
            console.log('[+] Encrypted data received (length:', req.body.encrypt_data.length, ')');
        }
    } catch(e) {}

    // Mock response based on captured patterns
    const response = {
        code: "00000",
        message: "SUCCESS",
        data: {
            paymentInfo: {
                orderNo: `POC_${Date.now()}`,
                amount: "100.00",
                currency: "NGN",
                serviceType: "coinsTransfer",
                status: "PENDING",
                createdAt: new Date().toISOString()
            }
        }
    };

    const plaintext = JSON.stringify(response);
    const aesKey = generateRandomAesKey();
    const encryptedData = aesEncrypt(plaintext, aesKey);

    return res.status(200).json({
        encrypt_aes_key: aesKey.toString('base64'),
        encrypt_data: encryptedData
    });
}

// ============================================
// 2. Confirm Pay Handler
// ============================================

async function handleConfirmPay(req, res) {
    console.log('[+] Handling: confirm_pay');
    
    // Check for special header
    const serviceType = req.headers['opay-transaction-service-type'];
    console.log('[+] Service Type:', serviceType);
    
    const response = {
        code: "00000",
        message: "SUCCESS",
        data: {
            orderNo: `CONFIRM_${Date.now()}`,
            status: "SUCCESS",
            paymentResult: "Transaction completed successfully",
            transactionTime: new Date().toISOString(),
            reference: `REF_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
    };

    const plaintext = JSON.stringify(response);
    const aesKey = generateRandomAesKey();
    const encryptedData = aesEncrypt(plaintext, aesKey);

    return res.status(200).json({
        encrypt_aes_key: aesKey.toString('base64'),
        encrypt_data: encryptedData
    });
}

// ============================================
// 3. Query Pay Result Handler
// ============================================

async function handleQueryPayResult(req, res) {
    console.log('[+] Handling: query_pay_result');
    
    const response = {
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

    const plaintext = JSON.stringify(response);
    const aesKey = generateRandomAesKey();
    const encryptedData = aesEncrypt(plaintext, aesKey);

    return res.status(200).json({
        encrypt_aes_key: aesKey.toString('base64'),
        encrypt_data: encryptedData
    });
}

// ============================================
// 4. Show Status Handler
// ============================================

async function handleShowStatus(req, res) {
    console.log('[+] Handling: showStatus');
    
    const response = {
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

    const plaintext = JSON.stringify(response);
    const aesKey = generateRandomAesKey();
    const encryptedData = aesEncrypt(plaintext, aesKey);

    return res.status(200).json({
        encrypt_aes_key: aesKey.toString('base64'),
        encrypt_data: encryptedData
    });
}

// ============================================
// 5. Transfer Order Handler (Original)
// ============================================

async function handleTransferOrder(req, res) {
    console.log('[+] Handling: transfer/create-order');
    
    const response = {
        code: "00000",
        message: "SUCCESSFUL",
        data: {
            orderStatus: "SUCCESS",
            serviceTypeTitle: "Money transfer",
            paymentResult: "Transaction is successful!",
            orderNo: `TRANSFER_${Date.now()}`,
            orderTime: new Date().toISOString(),
            saveBeneficiary: true
        }
    };

    const plaintext = JSON.stringify(response);
    const aesKey = generateRandomAesKey();
    const encryptedData = aesEncrypt(plaintext, aesKey);

    return res.status(200).json({
        encrypt_aes_key: aesKey.toString('base64'),
        encrypt_data: encryptedData
    });
}
