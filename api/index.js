// api/index.js - Universal handler
export default function handler(req, res) {

    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Body:', req.body);

    const path = req.url.split("?")[0];

    // GET /360/v
    if (path === "/360/v" && req.method === "GET") {
        return res.status(200).json({
            version: "1.1.8",
            url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
        });
    }

    // POST /360/l
    if (path === "/360/l" && req.method === "POST") {
        const now = new Date();
        const serverTime = now.toISOString()
            .replace("T", " ")
            .substring(0, 19);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            server_time_utc: now.toISOString(),
            server_time: serverTime,
            server_time_offset: 0,
            auth_check_interval: 3600,
            lock_expiry: "2099-01-01 00:00:00",
            login_time: serverTime,
            license_expiry: "2099-01-01 00:00:00",
            credits: 999999
        });
    }


    // Existing logic
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
        return res.status(200).send("0.7.93");
    }


    // Keep your old fallback
    return res.status(200).send('SUCCESS|732|2028-06-08');
}
