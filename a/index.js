export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url || '';

    // If request is from /a
    if (url.includes('/a')) {
        const email = req.query?.email || req.body?.email || 'test@example.com';
        return res.status(200).json({
            success: true,
            message: 'Access Granted!',
            status: 'active',
            user: {
                email: email,
                name: 'User',
                endpoint: '/a'
            }
        });
    }

    // If request is from /api (Knox Wizard)
    if (url.includes('/api')) {
        let action = '';
        try {
            if (req.body && req.body.action) {
                action = req.body.action;
            }
        } catch(e) {}

        if (action === 'get_patch_algorithms' || req.url.includes('algorithms')) {
            return res.status(200).json({
                status: "SUCCESS",
                algorithms: []
            });
        }

        if (action === 'get_secure_logic' || req.url.includes('secure')) {
            return res.status(200).json({
                status: "SUCCESS",
                data: "License valid"
            });
        }

        if (req.url.includes('check_update')) {
            return res.status(200).send("0.6.8");
        }

        return res.status(200).send('SUCCESS|33365|Cracked by ibrahimnet');
    }

    // Default response
    return res.status(200).json({
        success: true,
        message: 'Request processed',
        path: url
    });
}
