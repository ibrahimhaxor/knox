// Ultra-simple version - just returns plain JSON
export default async function handler(req, res) {
    console.log('[+] Request received:', req.method, req.url);
    console.log('[+] Headers:', req.headers);
    console.log('[+] Body:', req.body);
    
    // Generic success response
    const response = {
        code: "00000",
        message: "SUCCESSFUL",
        data: {
            orderStatus: "SUCCESS",
            orderNo: `POC_${Date.now()}`,
            paymentResult: "Transaction completed successfully",
            amount: "100.00",
            currency: "NGN"
        }
    };
    
    // For patched app, return as-is
    return res.status(200).json(response);
}
