export default async function handler(req, res) {

    const path = req.url.split("?")[0];

    // Safely parse body ONCE for all routes
    const body = await getBody(req);

    console.log("METHOD:", req.method);
    console.log("PATH:", path);
    console.log("BODY:", body);

    // GET /360/version
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

        const operation = body?.operation || 'spd';
        const request_id = body?.request_id || generateUUID();
        const cost = body?.cost || 2;
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
    // POST /360/login12  — with username validation
    // ============================================
    if (path === "/360/login12" && req.method === "POST") {

        const username = String(body?.username || "").trim();

        console.log("login12 username received:", JSON.stringify(username));

        if (username.toLowerCase() !== "ibrahimnet@360") {
            return res.status(400).json({
                success: false,
                message: "Invalid username",
                received_username: username
            });
        }

        const now = new Date();
        const time = now.toISOString()
            .replace("T", " ")
            .substring(0, 19);

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

    // ---- EXISTING FALLBACK LOGIC ----

    let action = "";

    try {
        if (body && body.action) {
            action = body.action;
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
// HELPER: safely parse body from any content type
// ============================================
async function getBody(req) {
    const ct = (req.headers && req.headers["content-type"]) || "";

    // Already parsed as object by the platform
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    // Buffer (some platforms give a Buffer)
    if (Buffer.isBuffer(req.body)) {
        const str = req.body.toString("utf8");
        return parseString(str, ct);
    }

    // String body
    if (typeof req.body === "string") {
        return parseString(req.body, ct);
    }

    // Raw stream (nothing parsed yet)
    return await new Promise((resolve) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(parseString(data, ct)));
        req.on("error", () => resolve({}));
    });
}

function parseString(str, contentType) {
    if (!str) return {};

    // form-urlencoded
    if (contentType.includes("application/x-www-form-urlencoded")) {
        try {
            return Object.fromEntries(new URLSearchParams(str));
        } catch (e) {
            return {};
        }
    }

    // JSON (default attempt)
    try {
        return JSON.parse(str);
    } catch (e) {
        // last-ditch: try urlencoded anyway
        try {
            return Object.fromEntries(new URLSearchParams(str));
        } catch (e2) {
            return {};
        }
    }
}

// ============================================
// HELPER: UUID
// ============================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
