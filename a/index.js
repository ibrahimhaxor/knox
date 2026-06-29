// a/index.js - Simple login response
module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const email = req.query?.email || req.body?.email || 'test@example.com';

    return res.status(200).json({
        success: true,
        message: 'Access Granted!',
        status: 'active',
        user: {
            email: email,
            name: 'Users',
            endpoint: '/a'
        }
    });
};
