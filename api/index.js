export default function handler(req, res) {

    // CORS + preflight
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const path = req.url.split("?")[0];

    console.log("METHOD:", req.method);
    console.log("PATH:", path);
    console.log("BODY:", req.body);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);

    // GET /360/version
    if (path === "/360/version" && req.method === "GET") {
        return res.status(200).json({
            version: "1.1.8",
            url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
        });
    }

    // /360/credit1234567
    if (path === "/360/credit1234567" && (req.method === "GET" || req.method === "POST")) {
        const operation = req.body?.operation || 'spd';
        const request_id = req.body?.request_id || generateUUID();
        const cost = req.body?.cost || 2;
        const now = new Date();

        const response = {
            success: true,
            message: "OK",
            operation: operation,
            request_id: request_id,
            cost: cost,
            credits_used: cost,
            credits_left: 248,
            balance: 248,
            confirmed_balance: 248,
            new_balance: 248,
            credits: 248,
            license_expiry: "2099-01-01 00:00:00",
            lock_expiry: "2099-01-01 00:00:00",
            server_time_utc: now.toISOString(),
            server_time: now.toISOString().replace("T", " ").substring(0, 19),
            auth_check_interval: 3600,
            server_time_offset: 0,
            login_time: now.toISOString().replace("T", " ").substring(0, 19)
        };

        if (operation === "spd") {
            response.message = "SPD operation successful";
        } else if (operation === "mtk") {
            response.message = "MTK operation successful";
        } else if (operation === "meta_fix_blackscreen") {
            response.message = "Meta fix blackscreen operation successful";
            response.meta_status = "fixed";
            response.blackscreen_fix = "applied";
        } else {
            response.message = "Operation successful";
        }

        return res.status(200).json(response);
    }

    // ============================================
    // POST /360/login12 — WITH CREDENTIAL CHECK
    // ============================================
    if (path === "/360/login12" && req.method === "POST") {

        // Accept JSON body, form-encoded body, or query params
        let body = req.body;
        if (typeof body === "string") {
            try { body = Object.fromEntries(new URLSearchParams(body)); } catch (e) {}
        }
        body = body || {};

        const urlObj = new URL(req.url, "http://localhost");
        const username = body.username || urlObj.searchParams.get("username");
        const password = body.password || urlObj.searchParams.get("password");

        console.log("LOGIN ATTEMPT:", { username, password });

        // Return 200 even on failure — many clients treat 401 as "network error"
        if (username !== "ibrahimnet" || password !== "ibrahim@360") {
            return res.status(200).json({
                success: false,
                message: "Incorrect username or password"
            });
        }

        const now = new Date();
        const time = now.toISOString().replace("T", " ").substring(0, 19);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            server_time_utc: now.toISOString(),
            server_time: time,
            server_time_offset: 0,
            auth_check_interval: 3600,
            lock_expiry: "2099-01-01 00:00:00",
            login_time: time,
            license_expiry: "2099-01-01 00:00:00",
            credits: 250
        });
    }

    // ---- EXISTING CODE BELOW ----
    let action = "";
    try {
        if (req.body && req.body.action) action = req.body.action;
    } catch(e) {}

    if (action === "get_patch_algorithms" || req.url.includes("algorithms")) {
        return res.status(200).json({ status: "SUCCESS", algorithms: [] });
    }
    if (action === "get_secure_logic" || req.url.includes("secure")) {
        return res.status(200).json({ status: "SUCCESS", data: "License valid" });
    }
    if (req.url.includes("check_update")) {
        return res.status(200).send("0.7.93");
    }

    return res.status(200).send("SUCCESS|732|2028-06-08");
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
