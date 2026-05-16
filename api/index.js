// api/index.js - Vercel serverless function
export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Log the request (optional, for debugging)
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    
    // Return the success response
    return res.status(200).send('SUCCESS|365|CTF{KnoxWizard_Cracked_By_IbraheemNet}');
}