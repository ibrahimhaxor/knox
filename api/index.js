export default function handler(req, res) {

    // ============================================
    // CORS + PREFLIGHT
    // ============================================
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

    // ============================================
    // GET /360/version
    // ============================================
    if (path === "/360/version" && req.method === "GET") {
        return res.status(200).json({
            version: "1.1.8",
            url: "https://www.mediafire.com/file/rqr0wr8uc4zq0op/360-tool-v1.2.1_fixed.zip/file"
        });
    }

    // ============================================
    // /360/credit1234567 - SPD, MTK, META_FIX_BLACKSCREEN
    // ============================================
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
            response.operation = "spd";

        } else if (operation === "mtk") {
            response.message = "MTK operation successful";
            response.operation = "mtk";

        } else if (operation === "meta_fix_blackscreen") {
            response.message = "Meta fix blackscreen operation successful";
            response.operation = "meta_fix_blackscreen";
            response.meta_status = "fixed";
            response.blackscreen_fix = "applied";

        } else {
            response.message = "Operation successful";
            response.operation = operation;
        }

        return res.status(200).json(response);
    }

    // ============================================
    // POST /360/login12 — WITH CREDENTIAL VALIDATION
    // ============================================
    if (path === "/360/login12" && req.method === "POST") {

        // ---- Parse body (JSON, form-encoded, or raw string) ----
        let body = req.body;

        if (typeof body === "string") {
            try {
                const parsed = Object.fromEntries(new URLSearchParams(body));
                if (Object.keys(parsed).length > 0) body = parsed;
            } catch (e) { /* ignore */ }
        }

        body = body || {};

        // ---- Pull credentials from any common field name ----
        const urlObj = new URL(req.url, "http://localhost");

        let username =
            body.username || body.user || body.login || body.email || body.name ||
            urlObj.searchParams.get("username") ||
            urlObj.searchParams.get("user") ||
            urlObj.searchParams.get("login") ||
            "";

        let password =
            body.password || body.pass || body.pwd || body.passwd ||
            urlObj.searchParams.get("password") ||
            urlObj.searchParams.get("pass") ||
            urlObj.searchParams.get("pwd") ||
            "";

        // ---- Normalize (decode, strip quotes, trim) ----
        username = decodeURIComponent(String(username)).replace(/^"|"$/g, "").trim();
        password = decodeURIComponent(String(password)).replace(/^"|"$/g, "").trim();

        // ---- DEBUG LOG (check Vercel logs if login fails) ----
        console.log("LOGIN ATTEMPT → username:", JSON.stringify(username));
        console.log("LOGIN ATTEMPT → password:", JSON.stringify(password));
        console.log("LOGIN RAW BODY:", JSON.stringify(req.body));

        // ---- Validate credentials ----
        const validUser = username.toLowerCase() === "ibrahimnet";
        const validPass = password === "ibrahim@360";

        if (!validUser || !validPass) {
            // Return 200 so the client displays the message instead of "network error"
            return res.status(200).json({
                success: false,
                message: "Incorrect username or password"
            });
        }

        // ---- Success response ----
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

    // ============================================
    // EXISTING ENDPOINTS BELOW
    // ============================================
    let action = "";

    try {
        if (req.body && req.body.action) {
            action = req.body.action;
        }
    } catch (e) {}

    if (action === "get_patch_algorithms" || req.url.includes("algorithms")) {
        return res.status(200).json({
            status: "SUCCESS",
            algorithms: []
        });
    }

    if (action === "get_secure_logic" || req.url.includes("secure")) {
        return res.status(200).json({
            status: "SUCCESS",
            data: "License valid"
        });
    }

    if (req.url.includes("check_update")) {
        return res.status(200).send("0.7.93");
    }

    // OLD FALLBACK
    return res.status(200).send("SUCCESS|732|2028-06-08");
}

// ============================================
// HELPER FUNCTION
// ============================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
